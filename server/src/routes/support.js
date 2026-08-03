import { Router } from 'express';
import * as ctrl from '../controllers/supportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';

const router = Router();

router.use(authenticate, requireBusiness);

router.get('/center', ctrl.getSupportCenter);
router.post('/sessions', ctrl.requestSupportSession);
router.post('/requests', ctrl.createSupportRequest);

export default router;
