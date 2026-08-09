import { Router } from 'express';
import * as ctrl from '../controllers/notificationsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requireActiveSubscription } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate);

router.get('/', requireBusiness, requireActiveSubscription, ctrl.listNotifications);
router.patch('/read-all', requireBusiness, requireActiveSubscription, ctrl.markAllRead);
router.patch('/:id/read', requireBusiness, requireActiveSubscription, ctrl.markRead);

export default router;
