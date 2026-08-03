import { Router } from 'express';
import { listActivity } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness);
router.get('/', listActivity);

export default router;
