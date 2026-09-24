import { Router } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { z } from 'zod';
import prisma from '../_lib/prisma.js';
import { requireAuth } from '../_lib/auth-middleware.js';
import { getPaymentProvider } from '../_lib/payment/index.js';

const router = Router();

const BookingCreateSchema = z.object({
  parkingId: z.string().min(1, 'Parking ID is required'),
  slotId: z.string().min(1, 'Slot ID is required'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

// POST /api/bookings - Create new reservation (Atomically prevents double-booking)
router.post('/', requireAuth, async (req, res) => {
  try {
    const parse = BookingCreateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors[0]?.message || 'Validation error',
      });
    }

    const { parkingId, slotId, startTime: startStr, endTime: endStr } = parse.data;
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time',
      });
    }

    const durationHours = Math.max(1, (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));

    // Execute atomic reservation within a Prisma interactive transaction to prevent race conditions / double bookings
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and verify slot status
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: { parking: true },
      });

      if (!slot) {
        throw new Error('Slot does not exist');
      }

      if (slot.parkingId !== parkingId) {
        throw new Error('Slot does not belong to specified parking location');
      }

      if (slot.status !== 'AVAILABLE') {
        throw new Error(`Slot is currently ${slot.status.toLowerCase()} and cannot be reserved.`);
      }

      // 2. Check for overlapping active bookings on this slot
      const overlapping = await tx.booking.findFirst({
        where: {
          slotId,
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              startTime: { lte: endTime },
              endTime: { gte: startTime },
            },
          ],
        },
      });

      if (overlapping) {
        throw new Error('Slot is already booked for this requested time window');
      }

      // 3. Calculate amount based on hours and slot price
      const totalAmount = parseFloat((durationHours * slot.pricePerHour).toFixed(2));

      // 4. Generate cryptographically random token
      const qrToken = `PS-TK-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

      // 5. Update slot status to RESERVED immediately
      await tx.slot.update({
        where: { id: slotId },
        data: { status: 'RESERVED' },
      });

      // 6. Create booking record
      const booking = await tx.booking.create({
        data: {
          userId: req.user.id,
          parkingId,
          slotId,
          startTime,
          endTime,
          amount: totalAmount,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          qrToken,
        },
        include: {
          parking: true,
          slot: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return booking;
    });

    // Generate QR Code data URL for the generated cryptographic token
    const qrCodeDataUrl = await QRCode.toDataURL(result.qrToken, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Slot reserved successfully',
      data: {
        booking: result,
        qrCode: qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error('Reservation error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to complete reservation',
    });
  }
});

// GET /api/bookings/mine - User's booking history
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        parking: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch booking history' });
  }
});

// GET /api/bookings/:id - Single booking details + QR code
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        parking: true,
        slot: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Authorization: User himself or Owner of the parking or Admin/MasterAdmin
    const isOwner = booking.parking.ownerId === req.user.id;
    const isClient = booking.userId === req.user.id;
    const isAdmin = ['ADMIN', 'MASTER_ADMIN'].includes(req.user.role);

    if (!isClient && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this booking' });
    }

    // Generate server-side QR Code for token
    const qrCodeDataUrl = await QRCode.toDataURL(booking.qrToken, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...booking,
        qrCode: qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error('Error retrieving booking:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve booking' });
  }
});

// POST /api/bookings/:id/pay - Process payment (Mock, Razorpay, or Stripe)
router.post('/:id/pay', requireAuth, async (req, res) => {
  try {
    const { provider = 'MOCK', paymentId, signature, orderId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { slot: true, parking: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.userId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, error: 'Booking is already paid' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Cannot pay for a cancelled booking' });
    }

    const gateway = getPaymentProvider(provider);
    const verification = await gateway.verifyPayment({
      orderId: orderId || `ord_${booking.id}`,
      paymentId: paymentId || `pay_${crypto.randomBytes(8).toString('hex')}`,
      signature,
    });

    if (!verification.success) {
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Transactionally update booking to CONFIRMED & PAID, slot remains RESERVED or OCCUPIED
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
        include: {
          parking: true,
          slot: true,
        },
      });

      // Keep slot RESERVED until actual vehicle arrival
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: 'RESERVED' },
      });

      return b;
    });

    const qrCodeDataUrl = await QRCode.toDataURL(updated.qrToken, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment completed and booking confirmed',
      data: {
        booking: updated,
        qrCode: qrCodeDataUrl,
        transactionId: verification.transactionId,
      },
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Payment processing failed',
    });
  }
});

// PATCH /api/bookings/:id/cancel - Commuter cancels reservation
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { slot: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.userId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this booking' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    // Atomic transaction: mark booking CANCELLED, refund payment status if was PAID, restore slot to AVAILABLE
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: booking.paymentStatus === 'PAID' ? 'REFUNDED' : booking.paymentStatus,
        },
      });

      // Reopen slot to AVAILABLE
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: 'AVAILABLE' },
      });

      return b;
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Slot has been freed.',
      data: updated,
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

export default router;
