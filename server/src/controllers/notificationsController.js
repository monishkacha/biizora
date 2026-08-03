import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const filter = { userId: req.userId };
  if (req.businessId) filter.businessId = req.businessId;

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ ...filter, read: false });

  res.json({
    notifications: notifications.map((n) => n.toPublicJSON()),
    unreadCount,
  });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { read: true }
  );
  res.json({ success: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const filter = { userId: req.userId, read: false };
  if (req.headers['x-business-id']) filter.businessId = req.headers['x-business-id'];
  await Notification.updateMany(filter, { read: true });
  res.json({ success: true });
});
