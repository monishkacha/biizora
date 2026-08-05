import { Router } from 'express';
import * as ctrl from '../controllers/customersController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requirePermission } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness);

router.get('/', requirePermission('customers', 'read'), ctrl.listCustomers);
router.post('/gst-search', requirePermission('customers', 'read'), ctrl.gstSearch);
router.post('/', requirePermission('customers', 'write'), ctrl.createCustomer);
router.patch('/:id', requirePermission('customers', 'write'), ctrl.updateCustomer);
router.delete('/:id', requirePermission('customers', 'delete'), ctrl.deleteCustomer);

export default router;
