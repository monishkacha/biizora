import { Customer } from '../models/Customer.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ businessId: req.businessId }).sort({ createdAt: -1 });
  res.json({ customers: customers.map((c) => c.toPublicJSON()) });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({
    businessId: req.businessId,
    ...req.body,
    outstandingBalance: req.body.outstandingBalance || 0,
    totalSpent: req.body.totalSpent || 0,
    status: req.body.status || 'active',
  });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'customer.created',
    entityType: 'Customer',
    entityId: customer._id,
    details: `Created customer ${customer.name}`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, customer: customer.toPublicJSON() });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  Object.assign(customer, req.body);
  await customer.save();

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'customer.updated',
    entityType: 'Customer',
    entityId: customer._id,
    details: `Updated customer ${customer.name}`,
    ip: req.ip,
  });

  res.json({ success: true, customer: customer.toPublicJSON() });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'customer.deleted',
    entityType: 'Customer',
    entityId: customer._id,
    details: `Deleted customer ${customer.name}`,
    ip: req.ip,
  });

  res.json({ success: true });
});

import { GstCache } from '../models/GstCache.js';
import { lookupGstin } from '../services/gstService.js';

export const gstSearch = asyncHandler(async (req, res) => {
  const { gstin } = req.body;
  if (!gstin) {
    return res.status(400).json({ error: 'GST Number is required' });
  }

  const normalized = gstin.trim().toUpperCase();

  // Validate format
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(normalized)) {
    return res.status(400).json({ error: 'Invalid GST Number' });
  }

  try {
    // Check Cache
    let cached = await GstCache.findOne({ gstin: normalized });
    if (cached) {
      return res.json({ success: true, cached: true, data: cached });
    }

    // Call Lookup
    const gstData = await lookupGstin(normalized);

    // Save to Cache
    const newCache = await GstCache.create(gstData);

    return res.json({ success: true, cached: false, data: newCache });
  } catch (err) {
    console.error('GST Search API Error:', err);
    return res.status(400).json({ error: err.message || 'Unable to Fetch Data' });
  }
});

