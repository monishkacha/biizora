import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import {
  getOpportunities,
  executeAction,
  getImpactMetrics,
} from '../controllers/growthEngineController.js';

const router = express.Router();

// All Growth Engine routes require Authentication & Business context
router.use(authenticate, requireBusiness);

router.get('/opportunities', getOpportunities);
router.post('/execute-action', executeAction);
router.get('/impact', getImpactMetrics);

export default router;
