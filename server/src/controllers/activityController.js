import { ActivityLog } from '../models/ActivityLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listActivity = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '30', 10)));
  const skip = (page - 1) * limit;

  const filter = { businessId: req.businessId };
  const [items, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  res.json({
    activity: items.map((a) => a.toPublicJSON()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
