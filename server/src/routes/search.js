import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requireActiveSubscription } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness, requireActiveSubscription);
router.get('/', globalSearch);

export default router;
