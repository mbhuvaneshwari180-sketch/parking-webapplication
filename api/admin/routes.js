import { Router } from 'express';
import prisma from '../_lib/prisma.js';
import { requireAuth, requireRole } from '../_lib/auth-middleware.js';
import { logAudit } from '../_lib/audit.js';

const router = Router();

// Protect all admin routes with requireAuth & ADMIN or MASTER_ADMIN
router.use(requireAuth, requireRole(['ADMIN', 'MASTER_ADMIN']));

// GET /api/admin/stats - Admin platform overview
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalParkings, totalSlots, totalBookings, totalRevenueResult] = await Promise.all([
      prisma.user.count(),
      prisma.parking.count(),
      prisma.slot.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    const activeParkings = await prisma.parking.count();
    const availableSlots = await prisma.slot.count({ where: { status: 'AVAILABLE' } });
    const occupiedSlots = await prisma.slot.count({
      where: { status: { in: ['OCCUPIED', 'RESERVED'] } },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalParkings,
        totalSlots,
        availableSlots,
        occupiedSlots,
        totalBookings,
        totalRevenue: totalRevenueResult._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch platform statistics' });
  }
});

// GET /api/admin/users - List users with filtering
router.get('/users', async (req, res) => {
  try {
    const { role, status, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            parkings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Admin user list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id - Update user status
router.patch('/users/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const targetUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Regular admin cannot suspend MASTER_ADMIN or another ADMIN
    if (req.user.role === 'ADMIN' && ['ADMIN', 'MASTER_ADMIN'].includes(targetUser.role)) {
      return res.status(403).json({
        success: false,
        error: 'Regular Admins cannot modify Admin or Master Admin accounts',
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        status: status || targetUser.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await logAudit(
      req.user.id,
      'USER_STATUS_UPDATED',
      `USER:${updated.id}`,
      { from: targetUser.status, to: updated.status, email: updated.email }
    );

    return res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// GET /api/admin/parkings - View all parkings across all owners
router.get('/parkings', async (req, res) => {
  try {
    const parkings = await prisma.parking.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { slots: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: parkings });
  } catch (error) {
    console.error('Admin parkings fetch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch parkings' });
  }
});

export default router;
