import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import {
  getTables,
  createOrUpdateTable,
  updateTableStatus,
  getReservations,
  createReservation,
  publicCreateReservation,
  updateReservationStatus,
  getMenuItems,
  createOrUpdateMenuItem,
  deleteMenuItem,
  getOrders,
  createOrder,
  updateKitchenStatus,
  processOrderPayment,
  publicCreateOrder,
  getInventory,
  createOrUpdateInventoryItem,
  recordWaste,
  getOffers,
  validateOffer,
  getDashboardMetrics,
} from '../controllers/restaurantController.js';

const router = express.Router();

// Public Endpoints (No Auth Required)
router.post('/public/booking', publicCreateReservation);
router.post('/public/order', publicCreateOrder);

// Protected Endpoints (Auth & Workspace Required)
router.use(authenticate, requireBusiness);

// Tables
router.get('/tables', getTables);
router.post('/tables', createOrUpdateTable);
router.patch('/tables/:id/status', updateTableStatus);

// Reservations
router.get('/reservations', getReservations);
router.post('/reservations', createReservation);
router.patch('/reservations/:id/status', updateReservationStatus);

// Menu
router.get('/menu', getMenuItems);
router.post('/menu', createOrUpdateMenuItem);
router.delete('/menu/:id', deleteMenuItem);

// Orders / POS
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.patch('/orders/:id/kitchen-status', updateKitchenStatus);
router.patch('/orders/:id/payment', processOrderPayment);

// Inventory & Waste
router.get('/inventory', getInventory);
router.post('/inventory', createOrUpdateInventoryItem);
router.post('/inventory/waste', recordWaste);

// Offers & Discounts
router.get('/offers', getOffers);
router.post('/offers/validate', validateOffer);

// Dashboard KPIs
router.get('/dashboard-metrics', getDashboardMetrics);

export default router;
