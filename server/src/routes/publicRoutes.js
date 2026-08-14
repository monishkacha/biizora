import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import {
  getPublicBusiness,
  publicRetailOrder,
  publicSalonBooking,
  publicRestaurantOrder,
  publicStationeryOrder,
  publicManufacturingQuote,
  getPublicOrderStatus,
  getPublicSalonBookingStatus,
  verifyPickupCode,
} from '../controllers/publicController.js';

const router = express.Router();

// Public Customer-Facing Routes (No Auth Required)
router.get('/business/:slug', getPublicBusiness);
router.post('/retail/order', publicRetailOrder);
router.post('/salon/book', publicSalonBooking);
router.get('/salon/booking-status/:id', getPublicSalonBookingStatus);
router.post('/restaurant/order', publicRestaurantOrder);
router.post('/stationery/order', publicStationeryOrder);
router.post('/manufacturing/quote', publicManufacturingQuote);
router.get('/order-status/:id', getPublicOrderStatus);

// Customer & Staff Pickup Verification Routes
router.post('/verify-pickup', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, () => requireBusiness(req, res, next));
  }
  next();
}, verifyPickupCode);
router.post('/verify-pickup-public', verifyPickupCode);

export default router;
