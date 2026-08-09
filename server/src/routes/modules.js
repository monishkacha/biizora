import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { resolveModulesForBusiness, resolveSidebarModules, getAllModules } from '../config/modules/index.js';
import { resolveDashboardWidgets, getBusinessType, normalizeBusinessType } from '../config/businessTypes.js';
import { getPlan } from '../config/plans.js';
import { listFeatureDefs } from '../config/features.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/** Public module catalogue (no secrets) */
router.get('/catalogue', (_req, res) => {
  res.json({ modules: getAllModules() });
});

router.use(authenticate, requireBusiness);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const business = req.business;
    const modules = resolveModulesForBusiness(business);
    const sidebar = resolveSidebarModules(business);
    const businessType = normalizeBusinessType(business.businessType || business.industry);
    const typeConfig = getBusinessType(businessType);
    const plan = getPlan(business.subscriptionPlan);

    res.json({
      business: business.toPublicJSON(),
      modules,
      sidebar,
      widgets: resolveDashboardWidgets(businessType),
      businessType: typeConfig,
      plan,
      customFeatures: listFeatureDefs(business.customFeatures || []),
      role: req.role,
      permissions: req.permissions,
    });
  })
);

export default router;
