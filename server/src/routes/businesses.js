import { Router } from 'express';
import * as ctrl from '../controllers/businessController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requirePermission } from '../middleware/requireBusiness.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.listBusinesses);
router.post('/', ctrl.createBusiness);

router.get('/:businessId', (req, res, next) => {
  req.headers['x-business-id'] = req.params.businessId;
  next();
}, requireBusiness, ctrl.getBusiness);

router.patch('/:businessId', (req, res, next) => {
  req.headers['x-business-id'] = req.params.businessId;
  next();
}, requireBusiness, requirePermission('settings', 'write'), ctrl.updateBusiness);

router.post('/:businessId/onboarding', (req, res, next) => {
  req.headers['x-business-id'] = req.params.businessId;
  next();
}, requireBusiness, requirePermission('settings', 'write'), ctrl.completeOnboarding);

export default router;
