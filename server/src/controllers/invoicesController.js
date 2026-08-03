import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';
import { Notification } from '../models/Notification.js';
import { Business } from '../models/Business.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ businessId: req.businessId }).sort({ createdAt: -1 });
  res.json({ invoices: invoices.map((i) => i.toPublicJSON()) });
});

export const createInvoice = asyncHandler(async (req, res) => {
  let invoiceNumber = req.body.invoiceNumber;
  if (!invoiceNumber) {
    const business = req.business || (await Business.findById(req.businessId));
    const count = await Invoice.countDocuments({ businessId: req.businessId });
    const prefix = business?.taxSettings?.invoicePrefix || 'INV-';
    invoiceNumber = `${prefix}${String(count + 101).padStart(3, '0')}`;
  }

  const status = req.body.status || 'pending';
  const invoice = await Invoice.create({
    businessId: req.businessId,
    ...req.body,
    invoiceNumber,
    paidAmount: status === 'paid' ? req.body.grandTotal || 0 : req.body.paidAmount || 0,
    paymentMethod: status === 'paid' ? (req.body.paymentMethod || 'UPI / Online') : (req.body.paymentMethod || 'Pending'),
  });

  if (invoice.customerId) {
    const customer = await Customer.findOne({ _id: invoice.customerId, businessId: req.businessId });
    if (customer) {
      customer.totalSpent += invoice.grandTotal;
      if (invoice.status !== 'paid') {
        customer.outstandingBalance += invoice.grandTotal;
      }
      await customer.save();
    }
  }

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'invoice.created',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: `Created invoice ${invoice.invoiceNumber}`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, invoice: invoice.toPublicJSON() });
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const prevStatus = invoice.status;
  const { status, paymentMethod } = req.body;
  const isPaid = status === 'paid';

  if (invoice.customerId && prevStatus !== 'paid' && isPaid) {
    await Customer.findOneAndUpdate(
      { _id: invoice.customerId, businessId: req.businessId },
      { $inc: { outstandingBalance: -invoice.grandTotal } }
    );
  }

  invoice.status = status;
  if (isPaid) {
    invoice.paidAmount = invoice.grandTotal;
    invoice.paymentMethod = paymentMethod || 'UPI / Online';
  }
  await invoice.save();

  await Notification.create({
    businessId: req.businessId,
    userId: req.userId,
    title: 'Invoice updated',
    message: `${invoice.invoiceNumber} marked as ${status}`,
    type: 'invoice',
    meta: { invoiceId: invoice._id.toString() },
  });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'invoice.status_updated',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: `${invoice.invoiceNumber}: ${prevStatus} → ${status}`,
    ip: req.ip,
  });

  res.json({ success: true, invoice: invoice.toPublicJSON() });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'invoice.deleted',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: `Deleted invoice ${invoice.invoiceNumber}`,
    ip: req.ip,
  });

  res.json({ success: true });
});

export const nextInvoiceNumber = asyncHandler(async (req, res) => {
  const count = await Invoice.countDocuments({ businessId: req.businessId });
  const prefix = req.business?.taxSettings?.invoicePrefix || 'INV-';
  res.json({ invoiceNumber: `${prefix}${String(count + 101).padStart(3, '0')}` });
});
