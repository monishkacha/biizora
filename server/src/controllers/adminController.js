import { Business } from '../models/Business.js';
import { Membership } from '../models/Membership.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { PLANS, SUBSCRIPTION_STATUSES, PLAN_IDS } from '../config/plans.js';
import { BUSINESS_TYPES, resolveDefaultModules } from '../config/businessTypes.js';
import { CUSTOM_FEATURES } from '../config/features.js';
import { getAllModules } from '../config/modules/index.js';
import { ROLES } from '../services/permissionDefaults.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function isSuperAdmin(user) {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(String(user.email || '').toLowerCase());
}

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!isSuperAdmin(req.user)) {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  req.skipSubscriptionCheck = true;
  next();
};

export const getPlatformConfig = asyncHandler(async (_req, res) => {
  res.json({
    plans: PLANS,
    subscriptionStatuses: SUBSCRIPTION_STATUSES,
    planIds: PLAN_IDS,
    businessTypes: BUSINESS_TYPES,
    customFeatures: CUSTOM_FEATURES,
    roles: ROLES,
    modules: getAllModules().map(({ component, ...rest }) => rest),
    supportEmail: 'biizora@gmail.com',
  });
});

export const listTenants = asyncHandler(async (req, res) => {
  const {
    status,
    plan,
    businessType,
    q,
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};
  if (status) filter.subscriptionStatus = status;
  if (plan) filter.subscriptionPlan = plan;
  if (businessType) filter.businessType = businessType;
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { ownerName: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit) || 50);
  const [items, total] = await Promise.all([
    Business.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(100, Number(limit) || 50)),
    Business.countDocuments(filter),
  ]);

  res.json({
    tenants: items.map((b) => b.toPublicJSON()),
    total,
    page: Number(page) || 1,
  });
});

export const getTenant = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  const members = await Membership.find({ businessId: business._id }).populate('userId', 'name email');
  res.json({
    tenant: business.toPublicJSON(),
    members: members.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      status: m.status,
      user: m.userId
        ? { id: m.userId._id.toString(), name: m.userId.name, email: m.userId.email }
        : null,
    })),
  });
});

export const activateTenant = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });

  const plan = req.body.plan || business.subscriptionPlan || 'starter';
  business.subscriptionStatus = 'Active';
  business.subscriptionPlan = PLAN_IDS.includes(plan) ? plan : 'starter';
  business.isActive = true;
  business.subscriptionActivatedAt = new Date();
  if (!business.enabledModules?.length) {
    business.enabledModules = resolveDefaultModules(business.businessType);
  }
  await business.save();

  await logActivity({
    businessId: business._id,
    userId: req.user._id,
    userName: req.user.name,
    action: 'admin.subscription_activated',
    entityType: 'Business',
    entityId: business._id,
    details: `Activated plan ${business.subscriptionPlan}`,
    ip: req.ip,
  });

  res.json({ success: true, tenant: business.toPublicJSON() });
});

export const suspendTenant = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  business.subscriptionStatus = 'Suspended';
  business.isActive = false;
  business.subscriptionNotes = req.body.reason || business.subscriptionNotes;
  await business.save();

  await logActivity({
    businessId: business._id,
    userId: req.user._id,
    userName: req.user.name,
    action: 'admin.subscription_suspended',
    entityType: 'Business',
    entityId: business._id,
    details: req.body.reason || 'Suspended by Super Admin',
    ip: req.ip,
  });

  res.json({ success: true, tenant: business.toPublicJSON() });
});

export const setTenantStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!SUBSCRIPTION_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Allowed: ${SUBSCRIPTION_STATUSES.join(', ')}` });
  }
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  business.subscriptionStatus = status;
  business.isActive = status === 'Active';
  if (status === 'Active' && !business.subscriptionActivatedAt) {
    business.subscriptionActivatedAt = new Date();
  }
  await business.save();
  res.json({ success: true, tenant: business.toPublicJSON() });
});

export const assignPlan = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!PLAN_IDS.includes(plan)) {
    return res.status(400).json({ error: `Invalid plan. Allowed: ${PLAN_IDS.join(', ')}` });
  }
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  business.subscriptionPlan = plan;
  await business.save();
  res.json({ success: true, tenant: business.toPublicJSON() });
});

export const setModules = asyncHandler(async (req, res) => {
  const { enabledModules } = req.body;
  if (!Array.isArray(enabledModules)) {
    return res.status(400).json({ error: 'enabledModules must be an array of module ids' });
  }
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  business.enabledModules = enabledModules;
  await business.save();
  res.json({ success: true, tenant: business.toPublicJSON() });
});

export const setCustomFeatures = asyncHandler(async (req, res) => {
  const { customFeatures } = req.body;
  if (!Array.isArray(customFeatures)) {
    return res.status(400).json({ error: 'customFeatures must be an array of feature ids' });
  }
  const known = Object.keys(CUSTOM_FEATURES);
  const invalid = customFeatures.filter((f) => !known.includes(f));
  if (invalid.length) {
    return res.status(400).json({ error: `Unknown features: ${invalid.join(', ')}`, known });
  }
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  business.customFeatures = customFeatures;
  await business.save();
  res.json({ success: true, tenant: business.toPublicJSON() });
});

export const resetTenant = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: 'Business not found' });

  business.subscriptionStatus = 'Pending';
  business.isActive = false;
  business.onboardingCompleted = false;
  business.enabledModules = resolveDefaultModules(business.businessType);
  business.customFeatures = [];
  business.subscriptionNotes = 'Reset by Super Admin';
  await business.save();

  await logActivity({
    businessId: business._id,
    userId: req.user._id,
    userName: req.user.name,
    action: 'admin.tenant_reset',
    entityType: 'Business',
    entityId: business._id,
    details: 'Tenant reset to Pending',
    ip: req.ip,
  });

  res.json({ success: true, tenant: business.toPublicJSON() });
});

export const platformAnalytics = asyncHandler(async (_req, res) => {
  const [
    totalBusinesses,
    active,
    pending,
    suspended,
    expired,
    cancelled,
    users,
    byType,
    byPlan,
    recentActivity,
  ] = await Promise.all([
    Business.countDocuments(),
    Business.countDocuments({ subscriptionStatus: 'Active' }),
    Business.countDocuments({ subscriptionStatus: 'Pending' }),
    Business.countDocuments({ subscriptionStatus: 'Suspended' }),
    Business.countDocuments({ subscriptionStatus: 'Expired' }),
    Business.countDocuments({ subscriptionStatus: 'Cancelled' }),
    User.countDocuments(),
    Business.aggregate([{ $group: { _id: '$businessType', count: { $sum: 1 } } }]),
    Business.aggregate([{ $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }]),
    ActivityLog.find().sort({ createdAt: -1 }).limit(20),
  ]);

  res.json({
    totals: {
      businesses: totalBusinesses,
      users,
      active,
      pending,
      suspended,
      expired,
      cancelled,
    },
    byType,
    byPlan,
    recentActivity,
  });
});
