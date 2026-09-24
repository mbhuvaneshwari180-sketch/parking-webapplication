import prisma from './prisma.js';

/**
 * Record an audit log entry for administrative & mutating actions
 * @param {string} actorId - User ID performing the action
 * @param {string} action - Description of the action (e.g. ROLE_PROMOTED, BOOKING_OVERRIDE)
 * @param {string} target - Target entity or identifier (e.g. USER:clx123, BOOKING:clx456)
 * @param {object} [metadata] - Additional details, before/after diffs, or reasons
 */
export async function logAudit(actorId, action, target, metadata = {}) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId,
        action,
        target,
        metadata,
      },
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't fail the primary request if audit logging encounters a database glitch
    return null;
  }
}
