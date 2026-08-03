import { Customer } from '../models/Customer.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { Expense } from '../models/Expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 1) {
    return res.json({ results: [] });
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const filter = { businessId: req.businessId };

  const [customers, products, invoices, expenses] = await Promise.all([
    Customer.find({ ...filter, $or: [{ name: regex }, { email: regex }, { gstin: regex }, { phone: regex }] }).limit(8),
    Product.find({ ...filter, $or: [{ name: regex }, { sku: regex }, { category: regex }] }).limit(8),
    Invoice.find({ ...filter, $or: [{ invoiceNumber: regex }, { customerName: regex }] }).limit(8),
    Expense.find({ ...filter, $or: [{ title: regex }, { vendor: regex }, { category: regex }] }).limit(8),
  ]);

  const results = [
    ...customers.map((c) => ({
      id: c._id.toString(),
      type: 'customer',
      title: c.name,
      subtitle: c.email || c.phone || c.gstin,
      path: '/app/customers',
    })),
    ...products.map((p) => ({
      id: p._id.toString(),
      type: 'product',
      title: p.name,
      subtitle: p.sku || p.category,
      path: '/app/products',
    })),
    ...invoices.map((i) => ({
      id: i._id.toString(),
      type: 'invoice',
      title: i.invoiceNumber,
      subtitle: `${i.customerName} · ₹${i.grandTotal}`,
      path: '/app/invoices',
    })),
    ...expenses.map((e) => ({
      id: e._id.toString(),
      type: 'expense',
      title: e.title,
      subtitle: `${e.vendor || e.category} · ₹${e.amount}`,
      path: '/app/expenses',
    })),
  ];

  res.json({ results });
});
