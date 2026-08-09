import { Router } from 'express';
import * as ctrl from '../controllers/invoicesController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requirePermission, requireActiveSubscription } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness, requireActiveSubscription);

router.get('/', requirePermission('invoices', 'read'), ctrl.listInvoices);
router.get('/next-number', requirePermission('invoices', 'read'), ctrl.nextInvoiceNumber);
router.post('/', requirePermission('invoices', 'write'), ctrl.createInvoice);
router.patch('/:id/status', requirePermission('invoices', 'write'), ctrl.updateInvoiceStatus);
router.delete('/:id', requirePermission('invoices', 'delete'), ctrl.deleteInvoice);

export default router;
