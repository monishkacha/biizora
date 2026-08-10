import { Router } from 'express';
import * as ctrl from '../controllers/stationeryController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requireActiveSubscription } from '../middleware/requireBusiness.js';

const router = Router();
router.use(authenticate, requireBusiness, requireActiveSubscription);

// Metrics & POS
router.get('/dashboard-metrics', ctrl.getDashboardMetrics);
router.post('/pos-bill', ctrl.createPosBill);
router.get('/invoices/:id', ctrl.getInvoice);

// Combos / School Kits
router.get('/combos', ctrl.listCombos);
router.post('/combos', ctrl.createCombo);
router.put('/combos/:id', ctrl.updateCombo);
router.delete('/combos/:id', ctrl.deleteCombo);

// School Orders
router.get('/school-orders', ctrl.listSchoolOrders);
router.post('/school-orders', ctrl.createSchoolOrder);
router.put('/school-orders/:id', ctrl.updateSchoolOrder);
router.post('/school-orders/:id/convert', ctrl.convertSchoolOrderToInvoice);

// Vendors & Purchases
router.get('/vendors', ctrl.listVendors);
router.post('/vendors', ctrl.createVendor);
router.put('/vendors/:id', ctrl.updateVendor);
router.post('/vendors/purchase', ctrl.recordVendorPurchase);

// Inventory & Stock Adjustment
router.get('/inventory/logs', ctrl.listStockLogs);
router.post('/inventory/adjust', ctrl.adjustStock);

// Reports
router.get('/reports/:type', ctrl.getReports);

// Settings
router.get('/settings', ctrl.getStationerySettings);
router.put('/settings', ctrl.updateStationerySettings);

// Seed
router.post('/seed', ctrl.seedStationeryDemo);

export default router;
