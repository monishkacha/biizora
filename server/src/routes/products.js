import { Router } from 'express';
import * as ctrl from '../controllers/productsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requirePermission, requireActiveSubscription } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness, requireActiveSubscription);

router.get('/', requirePermission('products', 'read'), ctrl.listProducts);
router.post('/', requirePermission('products', 'write'), ctrl.createProduct);
router.patch('/:id', requirePermission('products', 'write'), ctrl.updateProduct);
router.delete('/:id', requirePermission('products', 'delete'), ctrl.deleteProduct);

export default router;
