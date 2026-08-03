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
