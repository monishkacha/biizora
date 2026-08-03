import { Router } from 'express';
import * as ctrl from '../controllers/notificationsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate);

router.get('/', requireBusiness, ctrl.listNotifications);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

export default router;
