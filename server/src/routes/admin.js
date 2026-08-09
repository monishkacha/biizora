import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as ctrl from '../controllers/adminController.js';

const router = Router();

router.get('/config', ctrl.getPlatformConfig);

router.use(authenticate, ctrl.requireSuperAdmin);

router.get('/tenants', ctrl.listTenants);
router.get('/tenants/:id', ctrl.getTenant);
router.post('/tenants/:id/activate', ctrl.activateTenant);
router.post('/tenants/:id/suspend', ctrl.suspendTenant);
router.patch('/tenants/:id/status', ctrl.setTenantStatus);
router.patch('/tenants/:id/plan', ctrl.assignPlan);
router.patch('/tenants/:id/modules', ctrl.setModules);
router.patch('/tenants/:id/features', ctrl.setCustomFeatures);
router.post('/tenants/:id/reset', ctrl.resetTenant);
router.get('/analytics', ctrl.platformAnalytics);

export default router;
