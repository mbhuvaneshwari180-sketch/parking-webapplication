import { Router } from 'express';
import prisma from '../_lib/prisma.js';
import { requireAuth, requireRole } from '../_lib/auth-middleware.js';
import { logAudit } from '../_lib/audit.js';

const router = Router();

// Protect ALL routes in this file with strict requireRole(['MASTER_ADMIN'])
router.use(requireAuth, requireRole(['MASTER_ADMIN']));

// GET /api/master/overview - Global Super-Admin Analytics
router.get('/overview', async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalAdmins,
      totalParkings,
      totalSlots,
      totalBookings,
      revenueAggr,
      auditLogCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'COMMUTER' } }),
      prisma.user.count({ where: { role: 'OWNER' } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'MASTER_ADMIN'] } } }),
      prisma.parking.count(),
      prisma.slot.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.auditLog.count(),
    ]);

    // City-wise demand aggregation
    const cityDemandRaw = await prisma.parking.groupBy({
      by: ['city'],
      _count: { id: true },
    });

    const cityDemand = await Promise.all(
      cityDemandRaw.map(async (c) => {
        const bookingsCount = await prisma.booking.count({
          where: { parking: { city: c.city } },
        });
        const revenue = await prisma.booking.aggregate({
          where: { parking: { city: c.city }, paymentStatus: 'PAID' },
          _sum: { amount: true },
        });

        return {
          city: c.city,
          parkingsCount: c._count.id,
          bookingsCount,
          totalRevenue: revenue._sum.amount || 0,
        };
      })
    );

    // Top-performing parkings (MongoDB-compatible sorting)
    const allParkingsForTop = await prisma.parking.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { bookings: true, slots: true } },
      },
    });
    const topParkings = allParkingsForTop
      .sort((a, b) => (b._count?.bookings || 0) - (a._count?.bookings || 0))
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalOwners,
          totalAdmins,
          totalParkings,
          totalSlots,
          totalBookings,
          totalRevenue: revenueAggr._sum.amount || 0,
          auditLogCount,
        },
        cityDemand,
        topParkings,
      },
    });
  } catch (error) {
    console.error('Master overview error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch master overview' });
  }
});

// PATCH /api/master/users/:id/role - Promote / demote user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['COMMUTER', 'OWNER', 'ADMIN', 'MASTER_ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid target role' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await logAudit(
      req.user.id,
      'ROLE_CHANGED',
      `USER:${updated.id}`,
      { from: targetUser.role, to: updated.role, targetEmail: updated.email }
    );

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: updated,
    });
  } catch (error) {
    console.error('Master role update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update user role' });
  }
});

// PATCH /api/master/users/:id/status - Suspend / reactivate account
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid user status' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Safety: Master Admin cannot suspend own account
    if (targetUser.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot suspend your own account' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await logAudit(
      req.user.id,
      'USER_STATUS_OVERRIDE',
      `USER:${updated.id}`,
      { from: targetUser.status, to: updated.status, targetEmail: updated.email }
    );

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error('Master user status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update account status' });
  }
});

// DELETE /api/master/users/:id - Hard delete account
router.delete('/users/:id', async (req, res) => {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    await logAudit(
      req.user.id,
      'USER_HARD_DELETED',
      `USER:${targetUser.id}`,
      { email: targetUser.email, name: targetUser.name, role: targetUser.role }
    );

    return res.status(200).json({
      success: true,
      message: 'Account hard-deleted permanently from database',
    });
  } catch (error) {
    console.error('Master delete user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// PATCH /api/master/bookings/:id/override - Manual override booking & payment
router.patch('/bookings/:id/override', async (req, res) => {
  try {
    const { action, note } = req.body;
    // action: 'FORCE_CANCEL' | 'FORCE_CONFIRM' | 'FORCE_REFUND' | 'FORCE_COMPLETE'

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { slot: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    let updateData = {};
    let slotStatusUpdate = null;

    switch (action) {
      case 'FORCE_CANCEL':
        updateData = {
          status: 'CANCELLED',
          paymentStatus: booking.paymentStatus === 'PAID' ? 'REFUNDED' : booking.paymentStatus,
        };
        slotStatusUpdate = 'AVAILABLE';
        break;

      case 'FORCE_REFUND':
        updateData = {
          paymentStatus: 'REFUNDED',
          status: 'CANCELLED',
        };
        slotStatusUpdate = 'AVAILABLE';
        break;

      case 'FORCE_CONFIRM':
        updateData = {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
        };
        slotStatusUpdate = 'RESERVED';
        break;

      case 'FORCE_COMPLETE':
        updateData = {
          status: 'COMPLETED',
        };
        slotStatusUpdate = 'AVAILABLE';
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid override action specified' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: req.params.id },
        data: updateData,
        include: { slot: true, parking: true, user: true },
      });

      if (slotStatusUpdate) {
        await tx.slot.update({
          where: { id: booking.slotId },
          data: { status: slotStatusUpdate },
        });
      }

      return b;
    });

    // Record audit log entry
    await logAudit(
      req.user.id,
      `BOOKING_OVERRIDE_${action}`,
      `BOOKING:${updated.id}`,
      {
        previousStatus: booking.status,
        previousPaymentStatus: booking.paymentStatus,
        newStatus: updated.status,
        newPaymentStatus: updated.paymentStatus,
        slotId: booking.slotId,
        note: note || 'Manual override performed by Master Administrator',
      }
    );

    return res.status(200).json({
      success: true,
      message: `Booking successfully overridden with action: ${action}`,
      data: updated,
    });
  } catch (error) {
    console.error('Master booking override error:', error);
    return res.status(500).json({ success: false, error: 'Failed to override booking' });
  }
});

// GET /api/master/audit-logs - Full Audit Log Viewer
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, target, limit = 100 } = req.query;

    const where = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (target) where.target = { contains: target, mode: 'insensitive' };

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 100,
    });

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve audit logs' });
  }
});

// GET /api/master/settings - System settings panel
router.get('/settings', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'global_config' },
    });

    return res.status(200).json({
      success: true,
      data: setting ? setting.value : {},
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch system settings' });
  }
});

// PATCH /api/master/settings - Update global settings (maintenance mode, pricing rules, flags)
router.patch('/settings', async (req, res) => {
  try {
    const newConfig = req.body;

    const setting = await prisma.systemSetting.upsert({
      where: { key: 'global_config' },
      update: { value: newConfig },
      create: { key: 'global_config', value: newConfig },
    });

    await logAudit(
      req.user.id,
      'SYSTEM_SETTINGS_UPDATED',
      'SYSTEM:global_config',
      { updatedConfig: newConfig }
    );

    return res.status(200).json({
      success: true,
      message: 'System settings saved successfully',
      data: setting.value,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update system settings' });
  }
});

export default router;
