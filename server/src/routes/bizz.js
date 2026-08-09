import { Router } from 'express';
import * as ctrl from '../controllers/bizzController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requireActiveSubscription } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness, requireActiveSubscription);

router.get('/briefing', ctrl.getBriefing);
router.post('/chat', ctrl.handleChat);

export default router;
