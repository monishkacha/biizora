import { ActivityLog } from '../models/ActivityLog.js';

export async function logActivity({
  businessId,
  userId,
  userName,
  action,
  entityType = '',
  entityId = '',
  details = '',
  ip = '',
  meta = {},
}) {
  try {
    await ActivityLog.create({
      businessId: businessId || undefined,
      userId: userId || undefined,
      userName: userName || '',
      action,
      entityType,
      entityId: entityId?.toString?.() || entityId || '',
      details,
      ip,
      meta,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}
