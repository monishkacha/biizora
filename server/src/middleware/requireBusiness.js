import mongoose from 'mongoose';
import { Membership } from '../models/Membership.js';
import { Business } from '../models/Business.js';
import { hasPermission, hasPermissionString } from '../services/permissionDefaults.js';
import { isSubscriptionActive } from '../config/plans.js';
import { hasFeature } from '../config/features.js';
import { getModule } from '../config/modules/index.js';

/**
 * Tenant isolation middleware.
 * Every business-scoped request must carry X-Business-Id and an active membership.
 * Sets req.businessId, req.business, req.membership, req.role, req.permissions.
 */
export async function requireBusiness(req, res, next) {
  try {
    let businessId = req.headers['x-business-id'] || req.params.businessId || req.query.businessId;
    if (businessId === 'undefined' || businessId === 'null' || businessId === '') {
      businessId = null;
    }

    let membership;
    if (businessId && mongoose.Types.ObjectId.isValid(businessId)) {
      membership = await Membership.findOne({
        userId: req.userId,
        businessId,
        status: 'active',
      });
    } else {
      membership = await Membership.findOne({ userId: req.userId, status: 'active' }).sort({ role: 1 });
    }

    if (!membership) {
      return res.status(403).json({ error: 'You do not have access to this business' });
    }

    const targetId = businessId || membership.businessId;
    const business = await Business.findById(targetId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    req.businessId = business._id;
    req.business = business;
    req.membership = membership;
    req.role = membership.role;
    req.permissions = membership.permissions;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Reject API access when the tenant subscription is not Active.
 * Allow Super Admin routes or Demo Accounts to bypass.
 */
export function requireActiveSubscription(req, res, next) {
  if (req.skipSubscriptionCheck) return next();
  const business = req.business;
  if (!business) {
    return res.status(400).json({ error: 'Business context required' });
  }
  if (business.isDemoAccount || req.user?.isDemoAccount || req.user?.isSuperAdmin) return next();
  const status = business.subscriptionStatus || 'Pending';
  if (!isSubscriptionActive(status) || business.isActive === false) {
    return res.status(403).json({
      error: 'Subscription inactive',
      code: 'SUBSCRIPTION_INACTIVE',
      subscriptionStatus: status,
      message:
        status === 'Pending'
          ? 'Your subscription is pending activation. Please contact biizora@gmail.com'
          : `Business subscription is ${status}. Dashboard and APIs are unavailable.`,
    });
  }
  next();
}

export function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!hasPermission(req.permissions, resource, action)) {
      return res.status(403).json({
        error: `Permission denied: ${resource}.${action} required`,
      });
    }
    next();
  };
}

export function requirePermissionKey(permissionString) {
  return (req, res, next) => {
    if (!hasPermissionString(req.permissions, permissionString)) {
      return res.status(403).json({
        error: `Permission denied: ${permissionString} required`,
      });
    }
    next();
  };
}

/** Feature-flag gate — Business.customFeatures must include the flag */
export function requireFeature(featureId) {
  return (req, res, next) => {
    if (!hasFeature(req.business, featureId)) {
      return res.status(403).json({
        error: 'Feature not enabled for this business',
        code: 'FEATURE_DISABLED',
        feature: featureId,
      });
    }
    next();
  };
}

/** Module gate — module must be enabled / visible for the tenant */
export function requireModule(moduleId) {
  return (req, res, next) => {
    const mod = getModule(moduleId);
    if (!mod) {
      return res.status(404).json({ error: `Unknown module: ${moduleId}` });
    }
    if (mod.requiredFeature && !hasFeature(req.business, mod.requiredFeature)) {
      return res.status(403).json({
        error: 'Module requires a custom feature flag',
        code: 'FEATURE_DISABLED',
        feature: mod.requiredFeature,
      });
    }
    const enabled = req.business?.enabledModules || [];
    if (enabled.length > 0 && !enabled.includes(moduleId) && !mod.requiredFeature) {
      return res.status(403).json({
        error: 'Module not enabled for this business',
        code: 'MODULE_DISABLED',
        module: moduleId,
      });
    }
    next();
  };
}

/**
 * Helper for controllers: always scope queries by tenant.
 * Usage: Model.find(tenantFilter(req, { status: 'active' }))
 */
export function tenantFilter(req, extra = {}) {
  return { businessId: req.businessId, ...extra };
}
