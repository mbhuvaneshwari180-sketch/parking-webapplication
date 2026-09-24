import { Router } from 'express';
import { z } from 'zod';
import prisma from '../_lib/prisma.js';
import { requireAuth, requireRole } from '../_lib/auth-middleware.js';
import { generateSignedUploadParams, uploadImageServerSide } from '../_lib/cloudinary.js';

const router = Router();

const ParkingCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const SlotCreateSchema = z.object({
  code: z.string().min(1, 'Slot code is required'),
  type: z.enum(['CAR', 'BIKE', 'EV']),
  pricePerHour: z.number().positive('Price must be greater than 0'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']).optional(),
});

// GET /api/parkings - Public list & search
router.get('/', async (req, res) => {
  try {
    const { query, city, type } = req.query;

    const where = {};

    if (city && typeof city === 'string' && city.trim() !== '') {
      where.city = { contains: city.trim(), mode: 'insensitive' };
    }

    if (query && typeof query === 'string' && query.trim() !== '') {
      const q = query.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (type && ['CAR', 'BIKE', 'EV'].includes(type.toUpperCase())) {
      where.slots = {
        some: {
          type: type.toUpperCase(),
        },
      };
    }

    const parkings = await prisma.parking.findMany({
      where,
      include: {
        slots: {
          select: {
            id: true,
            code: true,
            type: true,
            status: true,
            pricePerHour: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute summary metrics per parking
    const formatted = parkings.map((p) => {
      const totalSlots = p.slots.length;
      const availableSlots = p.slots.filter((s) => s.status === 'AVAILABLE').length;
      const occupiedSlots = p.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
      const prices = p.slots.map((s) => s.pricePerHour);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const supportedTypes = Array.from(new Set(p.slots.map((s) => s.type)));

      return {
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        description: p.description,
        latitude: p.latitude,
        longitude: p.longitude,
        imageUrl: p.imageUrl,
        owner: p.owner,
        totalSlots,
        availableSlots,
        occupiedSlots,
        minPrice,
        maxPrice,
        supportedTypes,
        slots: p.slots,
      };
    });

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching parkings:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch parking locations' });
  }
});

// GET /api/parkings/upload-signature - Signed upload parameters for Cloudinary
router.get('/upload-signature', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), (req, res) => {
  try {
    const params = generateSignedUploadParams('parkingspot');
    return res.status(200).json({ success: true, data: params });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate upload signature' });
  }
});

// GET /api/parkings/:id - Public detailed view
router.get('/:id', async (req, res) => {
  try {
    const parking = await prisma.parking.findUnique({
      where: { id: req.params.id },
      include: {
        slots: {
          orderBy: { code: 'asc' },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking location not found' });
    }

    const availableSlots = parking.slots.filter((s) => s.status === 'AVAILABLE').length;
    const occupiedSlots = parking.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;

    return res.status(200).json({
      success: true,
      data: {
        ...parking,
        availableSlots,
        occupiedSlots,
      },
    });
  } catch (error) {
    console.error('Error fetching parking detail:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch parking location' });
  }
});

// GET /api/parkings/:id/slots - Poll-friendly live status
router.get('/:id/slots', async (req, res) => {
  try {
    // Set explicit cache-control headers to prevent HTTP 304 or browser caching during polling
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const slots = await prisma.slot.findMany({
      where: { parkingId: req.params.id },
      orderBy: { code: 'asc' },
    });

    const counts = {
      total: slots.length,
      available: slots.filter((s) => s.status === 'AVAILABLE').length,
      occupied: slots.filter((s) => s.status === 'OCCUPIED').length,
      reserved: slots.filter((s) => s.status === 'RESERVED').length,
      maintenance: slots.filter((s) => s.status === 'MAINTENANCE').length,
    };

    return res.status(200).json({
      success: true,
      data: {
        slots,
        counts,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error polling slots:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch live slot status' });
  }
});

// POST /api/parkings - Create parking (Owner, Admin, Master Admin)
router.post('/', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), async (req, res) => {
  try {
    const parse = ParkingCreateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors[0]?.message || 'Validation error',
      });
    }

    const { name, address, city, description, latitude, longitude, imageUrl } = parse.data;

    const parking = await prisma.parking.create({
      data: {
        name,
        address,
        city,
        description,
        latitude,
        longitude,
        imageUrl: imageUrl || null,
        ownerId: req.user.id,
      },
      include: {
        slots: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Parking created successfully',
      data: parking,
    });
  } catch (error) {
    console.error('Error creating parking:', error);
    return res.status(500).json({ success: false, error: 'Failed to create parking location' });
  }
});

// POST /api/parkings/:id/image - Upload parking image via Cloudinary SDK directly
router.post('/:id/image', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), async (req, res) => {
  try {
    const parking = await prisma.parking.findUnique({
      where: { id: req.params.id },
    });

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking location not found' });
    }

    // Role check: Only the parking owner or admin/master can update
    if (parking.ownerId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this parking location' });
    }

    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ success: false, error: 'Missing image data payload' });
    }

    const uploadRes = await uploadImageServerSide(imageData, 'parkingspot');

    const updated = await prisma.parking.update({
      where: { id: req.params.id },
      data: { imageUrl: uploadRes.secure_url },
    });

    return res.status(200).json({
      success: true,
      message: 'Parking photo uploaded successfully',
      data: { imageUrl: updated.imageUrl },
    });
  } catch (error) {
    console.error('Cloudinary direct upload error:', error);
    return res.status(500).json({ success: false, error: 'Failed to upload photo to Cloudinary' });
  }
});

// PATCH /api/parkings/:id - Edit parking details
router.patch('/:id', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), async (req, res) => {
  try {
    const parking = await prisma.parking.findUnique({
      where: { id: req.params.id },
    });

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking location not found' });
    }

    if (parking.ownerId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this parking' });
    }

    const updated = await prisma.parking.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name ?? parking.name,
        address: req.body.address ?? parking.address,
        city: req.body.city ?? parking.city,
        description: req.body.description ?? parking.description,
        latitude: req.body.latitude ? Number(req.body.latitude) : parking.latitude,
        longitude: req.body.longitude ? Number(req.body.longitude) : parking.longitude,
        imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : parking.imageUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Parking location updated',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating parking:', error);
    return res.status(500).json({ success: false, error: 'Failed to update parking location' });
  }
});

// DELETE /api/parkings/:id
router.delete('/:id', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), async (req, res) => {
  try {
    const parking = await prisma.parking.findUnique({
      where: { id: req.params.id },
    });

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking location not found' });
    }

    if (parking.ownerId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this parking' });
    }

    await prisma.parking.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Parking location deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting parking:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete parking location' });
  }
});

// POST /api/parkings/:id/slots - Add a slot
router.post('/:id/slots', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), async (req, res) => {
  try {
    const parking = await prisma.parking.findUnique({
      where: { id: req.params.id },
    });

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking location not found' });
    }

    if (parking.ownerId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const parse = SlotCreateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors[0]?.message || 'Validation error',
      });
    }

    const { code, type, pricePerHour, status } = parse.data;

    // Check duplicate code in same parking
    const existing = await prisma.slot.findFirst({
      where: { parkingId: req.params.id, code },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Slot code "${code}" already exists in this parking location`,
      });
    }

    const slot = await prisma.slot.create({
      data: {
        parkingId: req.params.id,
        code,
        type,
        pricePerHour,
        status: status || 'AVAILABLE',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Slot added successfully',
      data: slot,
    });
  } catch (error) {
    console.error('Error adding slot:', error);
    return res.status(500).json({ success: false, error: 'Failed to add parking slot' });
  }
});

// PATCH /api/parkings/slots/:slotId - Edit slot
router.patch('/slots/:slotId', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), async (req, res) => {
  try {
    const slot = await prisma.slot.findUnique({
      where: { id: req.params.slotId },
      include: { parking: true },
    });

    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    if (slot.parking.ownerId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this slot' });
    }

    const updated = await prisma.slot.update({
      where: { id: req.params.slotId },
      data: {
        code: req.body.code ?? slot.code,
        type: req.body.type ?? slot.type,
        status: req.body.status ?? slot.status,
        pricePerHour: req.body.pricePerHour ? Number(req.body.pricePerHour) : slot.pricePerHour,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Slot updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating slot:', error);
    return res.status(500).json({ success: false, error: 'Failed to update slot' });
  }
});

// DELETE /api/parkings/slots/:slotId
router.delete('/slots/:slotId', requireAuth, requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN']), async (req, res) => {
  try {
    const slot = await prisma.slot.findUnique({
      where: { id: req.params.slotId },
      include: { parking: true },
    });

    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    if (slot.parking.ownerId !== req.user.id && !['ADMIN', 'MASTER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this slot' });
    }

    await prisma.slot.delete({
      where: { id: req.params.slotId },
    });

    return res.status(200).json({
      success: true,
      message: 'Slot removed successfully',
    });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete slot' });
  }
});

export default router;
