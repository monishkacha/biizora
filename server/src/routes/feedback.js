import { Router } from 'express';
import * as ctrl from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/auth.js';
import { optionalAuthenticate, requireAdmin } from '../middleware/optionalAuth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';

const router = Router();

/** Public + optional auth — landing page submissions */
router.post('/', optionalAuthenticate, ctrl.createFeedback);

/** Admin response & status pipeline (before /:id) */
router.get('/admin/all', authenticate, requireAdmin, ctrl.listAllFeedbackAdmin);
router.post('/admin/:id/replies', authenticate, requireAdmin, ctrl.replyAsAdmin);
router.patch('/admin/:id/status', authenticate, requireAdmin, ctrl.updateFeedbackStatus);

/** Authenticated business workspace */
router.get('/', authenticate, requireBusiness, ctrl.listMyFeedback);
router.get('/:id', authenticate, requireBusiness, ctrl.getFeedback);
router.post('/:id/replies', authenticate, requireBusiness, ctrl.replyAsUser);

export default router;
