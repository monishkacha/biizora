import { Router } from 'express';
import * as ctrl from '../controllers/expensesController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requirePermission, requireActiveSubscription } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness, requireActiveSubscription);

router.get('/', requirePermission('expenses', 'read'), ctrl.listExpenses);
router.post('/', requirePermission('expenses', 'write'), ctrl.createExpense);
router.delete('/:id', requirePermission('expenses', 'delete'), ctrl.deleteExpense);

export default router;
