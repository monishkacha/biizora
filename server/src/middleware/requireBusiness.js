import { Membership } from '../models/Membership.js';
import { Business } from '../models/Business.js';
import { hasPermission } from '../services/permissionDefaults.js';

export async function requireBusiness(req, res, next) {
  try {
    const businessId = req.headers['x-business-id'] || req.params.businessId || req.query.businessId;
    if (!businessId) {
      return res.status(400).json({ error: 'X-Business-Id header is required' });
    }

    const membership = await Membership.findOne({
      userId: req.userId,
      businessId,
      status: 'active',
    });

    if (!membership) {
      return res.status(403).json({ error: 'You do not have access to this business' });
    }

    const business = await Business.findById(businessId);
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
