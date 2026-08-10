import { Invoice } from '../models/Invoice.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Supplier } from '../models/Supplier.js';
import { Business } from '../models/Business.js';
import { SchoolOrder } from '../models/SchoolOrder.js';
import { ProductCombo } from '../models/ProductCombo.js';
import { StationeryStockLog } from '../models/StationeryStockLog.js';
import { VendorPurchase } from '../models/VendorPurchase.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return String(dateStr).slice(0, 10) === todayISO();
}

function isYesterday(dateStr) {
  if (!dateStr) return false;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return String(dateStr).slice(0, 10) === d.toISOString().slice(0, 10);
}

async function logStockChange({ businessId, product, changeQty, type, reason, reference, staffName }) {
  const stockAfter = product.stock;
  await StationeryStockLog.create({
    businessId,
    productId: product._id,
    productName: product.name,
    changeQuantity: changeQty,
    stockAfter,
    type,
    reason,
    reference,
    staffName,
  });
}

async function deductProductStock({ businessId, productId, quantity, type, reference, allowNegative, staffName }) {
  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) return null;
  const newStock = product.stock - quantity;
  if (newStock < 0 && !allowNegative && !product.allowNegativeStock) {
    throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { status: 400 });
  }
  product.stock = newStock;
  await product.save();
  await logStockChange({
    businessId,
    product,
    changeQty: -quantity,
    type,
    reference,
    staffName,
  });
  return product;
}

async function addProductStock({ businessId, productId, quantity, type, reason, reference, staffName }) {
  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) return null;
  product.stock += quantity;
  await product.save();
  await logStockChange({
    businessId,
    product,
    changeQty: quantity,
    type,
    reason,
    reference,
    staffName,
  });
  return product;
}

function calcLineItem(item) {
  const qty = Number(item.quantity) || 1;
  const rate = Number(item.rate) || 0;
  const discountPct = item.discountType === 'percent' ? Number(item.discount) || 0 : 0;
  const discountFixed = item.discountType === 'fixed' ? Number(item.discount) || 0 : 0;
  const lineBase = qty * rate;
  const discountAmt = discountPct ? (lineBase * discountPct) / 100 : discountFixed;
  const taxable = Math.max(0, lineBase - discountAmt);
  const gstRate = Number(item.gstRate) || 0;
  const taxAmount = (taxable * gstRate) / 100;
  const amount = taxable + taxAmount;
  const half = taxAmount / 2;
  return {
    ...item,
    quantity: qty,
    rate,
    discount: discountPct || discountFixed,
    discountType: item.discountType || (discountPct ? 'percent' : 'fixed'),
    taxableValue: taxable,
    taxAmount,
    totalGst: taxAmount,
    cgstRate: gstRate / 2,
    sgstRate: gstRate / 2,
    cgstAmount: half,
    sgstAmount: half,
    amount,
  };
}

function summarizeInvoice(items, billDiscount = 0) {
  const processed = items.map(calcLineItem);
  const subtotal = processed.reduce((s, i) => s + i.quantity * i.rate, 0);
  const taxableAmount = processed.reduce((s, i) => s + i.taxableValue, 0) - billDiscount;
  const totalTax = processed.reduce((s, i) => s + i.taxAmount, 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const grandTotal = Math.max(0, taxableAmount + totalTax);
  return { processed, subtotal, taxableAmount, totalTax, cgst, sgst, grandTotal };
}

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const businessId = req.businessId;
  const [invoices, products, schoolOrders] = await Promise.all([
    Invoice.find({ businessId }),
    Product.find({ businessId }),
    SchoolOrder.find({ businessId }),
  ]);

  const paidToday = invoices.filter((i) => i.status === 'paid' && isToday(i.issueDate || i.createdAt));
  const paidYesterday = invoices.filter((i) => i.status === 'paid' && isYesterday(i.issueDate || i.createdAt));
  const todaySales = paidToday.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const yesterdaySales = paidYesterday.reduce((s, i) => s + (i.grandTotal || 0), 0);

  const xeroxToday = paidToday
    .filter((i) => i.invoiceType === 'xerox' || i.invoiceType === 'retail')
    .flatMap((i) => i.items || [])
    .filter((item) => item.itemType === 'service')
    .reduce((s, item) => s + (item.amount || 0), 0);

  const lowStock = products.filter((p) => p.stock <= p.minStockLevel);
  const pendingSchoolOrders = schoolOrders.filter((o) => !['Delivered', 'Paid'].includes(o.status));

  res.json({
    metrics: {
      todaySales,
      yesterdaySales,
      salesChange: yesterdaySales ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0,
      billsToday: paidToday.length,
      lowStockCount: lowStock.length,
      pendingSchoolOrders: pendingSchoolOrders.length,
      xeroxRevenueToday: xeroxToday,
      creditCustomers: (await Customer.countDocuments({ businessId, outstandingBalance: { $gt: 0 } })),
    },
  });
});

export const createPosBill = asyncHandler(async (req, res) => {
  const businessId = req.businessId;
  const business = req.business || (await Business.findById(businessId));
  const {
    customerId,
    customerName = 'Walk-in Customer',
    customerPhone = '',
    customerGstin = '',
    items = [],
    comboItems = [],
    discount = 0,
    paymentMethod = 'Cash',
    paymentSplit = [],
    amountReceived = 0,
    status = 'paid',
    invoiceType = 'retail',
    notes = '',
    allowNegativeStock = false,
  } = req.body;

  if (!items.length && !comboItems.length) {
    return res.status(400).json({ error: 'Bill must have at least one item' });
  }

  const count = await Invoice.countDocuments({ businessId });
  const prefix = business?.taxSettings?.invoicePrefix || business?.invoicePrefix || 'INV-2026-';
  const invoiceNumber = `${prefix}${String(count + 1).padStart(4, '0')}`;

  let allItems = [...items];
  for (const combo of comboItems) {
    const comboDoc = await ProductCombo.findOne({ _id: combo.comboId, businessId });
    if (!comboDoc) continue;
    const qty = Number(combo.quantity) || 1;
    allItems.push({
      itemType: 'combo',
      description: comboDoc.name,
      quantity: qty,
      rate: comboDoc.sellingPrice,
      gstRate: comboDoc.gstRate,
      discount: 0,
      discountType: 'fixed',
      productId: comboDoc._id,
    });
    for (const ci of comboDoc.items) {
      await deductProductStock({
        businessId,
        productId: ci.productId,
        quantity: ci.quantity * qty,
        type: 'combo_sale',
        reference: invoiceNumber,
        allowNegative: allowNegativeStock,
        staffName: req.user?.name,
      });
    }
  }

  const { processed, subtotal, taxableAmount, totalTax, cgst, sgst, grandTotal } = summarizeInvoice(allItems, discount);
  const balanceDue = Math.max(0, grandTotal - Number(amountReceived));

  const invoice = await Invoice.create({
    businessId,
    invoiceNumber,
    customerId: customerId || undefined,
    customerName,
    customerPhone,
    customerGstin,
    issueDate: todayISO(),
    dueDate: todayISO(),
    items: processed,
    subtotal,
    discount,
    taxableAmount,
    cgst,
    sgst,
    totalTax,
    grandTotal,
    status: balanceDue > 0 && status === 'paid' ? 'pending' : status,
    paidAmount: status === 'paid' ? Math.min(grandTotal, Number(amountReceived) || grandTotal) : 0,
    paymentMethod,
    paymentSplit,
    amountReceived: Number(amountReceived) || (status === 'paid' ? grandTotal : 0),
    balanceDue,
    invoiceType,
    notes,
  });

  for (const item of processed) {
    if (item.itemType === 'service') continue;
    if (item.itemType === 'combo') continue;
    if (item.productId) {
      await deductProductStock({
        businessId,
        productId: item.productId,
        quantity: item.quantity,
        type: 'sale',
        reference: invoiceNumber,
        allowNegative: allowNegativeStock,
        staffName: req.user?.name,
      });
    }
  }

  if (customerId) {
    const customer = await Customer.findOne({ _id: customerId, businessId });
    if (customer) {
      customer.totalSpent += grandTotal;
      if (invoice.status !== 'paid') customer.outstandingBalance += balanceDue || grandTotal;
      await customer.save();
    }
  }

  await logActivity({
    businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'stationery.bill_created',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: `POS bill ${invoiceNumber} — ₹${grandTotal.toFixed(2)}`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, invoice: invoice.toPublicJSON() });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ invoice: invoice.toPublicJSON() });
});

export const listCombos = asyncHandler(async (req, res) => {
  const combos = await ProductCombo.find({ businessId: req.businessId, isActive: true });
  const enriched = await Promise.all(
    combos.map(async (combo) => {
      const json = combo.toPublicJSON();
      const productDetails = await Promise.all(
        combo.items.map(async (ci) => {
          const p = await Product.findById(ci.productId);
          return { productId: ci.productId.toString(), quantity: ci.quantity, name: p?.name || '', stock: p?.stock || 0 };
        })
      );
      return { ...json, productDetails };
    })
  );
  res.json({ combos: enriched });
});

export const createCombo = asyncHandler(async (req, res) => {
  const combo = await ProductCombo.create({ businessId: req.businessId, ...req.body });
  res.status(201).json({ success: true, combo: combo.toPublicJSON() });
});

export const updateCombo = asyncHandler(async (req, res) => {
  const combo = await ProductCombo.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!combo) return res.status(404).json({ error: 'Combo not found' });
  Object.assign(combo, req.body);
  await combo.save();
  res.json({ success: true, combo: combo.toPublicJSON() });
});

export const deleteCombo = asyncHandler(async (req, res) => {
  const combo = await ProductCombo.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
  if (!combo) return res.status(404).json({ error: 'Combo not found' });
  res.json({ success: true });
});

export const listSchoolOrders = asyncHandler(async (req, res) => {
  const orders = await SchoolOrder.find({ businessId: req.businessId }).sort({ createdAt: -1 });
  res.json({ orders: orders.map((o) => o.toPublicJSON()) });
});

export const createSchoolOrder = asyncHandler(async (req, res) => {
  const count = await SchoolOrder.countDocuments({ businessId: req.businessId });
  const orderNumber = `SO-${String(count + 1).padStart(4, '0')}`;
  const items = req.body.items || [];
  const quotedTotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.quotedPrice) || 0), 0);
  const order = await SchoolOrder.create({
    businessId: req.businessId,
    orderNumber,
    ...req.body,
    quotedTotal,
    orderDate: req.body.orderDate || todayISO(),
  });

  if (order.status === 'Confirmed') {
    for (const item of items) {
      if (item.productId) {
        await deductProductStock({
          businessId: req.businessId,
          productId: item.productId,
          quantity: item.quantity,
          type: 'school_order',
          reference: orderNumber,
          staffName: req.user?.name,
        });
      }
    }
  }

  res.status(201).json({ success: true, order: order.toPublicJSON() });
});

export const updateSchoolOrder = asyncHandler(async (req, res) => {
  const order = await SchoolOrder.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!order) return res.status(404).json({ error: 'School order not found' });
  const prevStatus = order.status;
  Object.assign(order, req.body);
  if (req.body.items) {
    order.quotedTotal = req.body.items.reduce(
      (s, i) => s + (Number(i.quantity) || 0) * (Number(i.quotedPrice) || 0),
      0
    );
  }
  await order.save();

  if (prevStatus !== 'Confirmed' && order.status === 'Confirmed') {
    for (const item of order.items) {
      if (item.productId) {
        await deductProductStock({
          businessId: req.businessId,
          productId: item.productId,
          quantity: item.quantity,
          type: 'school_order',
          reference: order.orderNumber,
          staffName: req.user?.name,
        });
      }
    }
  }

  res.json({ success: true, order: order.toPublicJSON() });
});

export const convertSchoolOrderToInvoice = asyncHandler(async (req, res) => {
  const order = await SchoolOrder.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!order) return res.status(404).json({ error: 'School order not found' });
  if (order.invoiceId) return res.status(400).json({ error: 'Order already converted to invoice' });

  const business = req.business || (await Business.findById(req.businessId));
  const count = await Invoice.countDocuments({ businessId: req.businessId });
  const prefix = business?.taxSettings?.invoicePrefix || 'INV-2026-';
  const invoiceNumber = `${prefix}${String(count + 1).padStart(4, '0')}`;

  const items = order.items.map((item) => ({
    productId: item.productId,
    itemType: 'product',
    description: item.description,
    quantity: item.quantity,
    rate: item.quotedPrice,
    gstRate: 12,
    discount: 0,
    discountType: 'fixed',
  }));

  const { processed, subtotal, taxableAmount, totalTax, cgst, sgst, grandTotal } = summarizeInvoice(items);
  const advance = order.advanceReceived || 0;
  const balanceDue = Math.max(0, grandTotal - advance);

  const invoice = await Invoice.create({
    businessId: req.businessId,
    invoiceNumber,
    customerId: order.customerId,
    customerName: order.schoolName,
    customerPhone: order.phone,
    issueDate: todayISO(),
    dueDate: order.deliveryDate || todayISO(),
    items: processed,
    subtotal,
    taxableAmount,
    cgst,
    sgst,
    totalTax,
    grandTotal,
    status: balanceDue > 0 ? 'pending' : 'paid',
    paidAmount: advance,
    amountReceived: advance,
    balanceDue,
    paymentMethod: advance > 0 ? 'Advance + Credit' : 'Credit',
    invoiceType: 'school',
    notes: `School order ${order.orderNumber}`,
  });

  order.invoiceId = invoice._id;
  order.status = 'Delivered';
  await order.save();

  res.status(201).json({ success: true, invoice: invoice.toPublicJSON(), order: order.toPublicJSON() });
});

export const listVendors = asyncHandler(async (req, res) => {
  const vendors = await Supplier.find({ businessId: req.businessId }).sort({ name: 1 });
  const purchases = await VendorPurchase.find({ businessId: req.businessId });
  res.json({
    vendors: vendors.map((v) => v.toPublicJSON()),
    purchases: purchases.map((p) => p.toPublicJSON()),
  });
});

export const createVendor = asyncHandler(async (req, res) => {
  const vendor = await Supplier.create({ businessId: req.businessId, ...req.body });
  res.status(201).json({ success: true, vendor: vendor.toPublicJSON() });
});

export const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Supplier.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  Object.assign(vendor, req.body);
  await vendor.save();
  res.json({ success: true, vendor: vendor.toPublicJSON() });
});

export const recordVendorPurchase = asyncHandler(async (req, res) => {
  const { vendorId, productId, quantity, unitCost, paidAmount = 0, notes = '' } = req.body;
  const vendor = await Supplier.findOne({ _id: vendorId, businessId: req.businessId });
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  const product = productId ? await Product.findOne({ _id: productId, businessId: req.businessId }) : null;
  const totalAmount = (Number(quantity) || 0) * (Number(unitCost) || 0);
  const paymentStatus = paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

  const purchase = await VendorPurchase.create({
    businessId: req.businessId,
    vendorId,
    vendorName: vendor.name,
    productId,
    productName: product?.name || req.body.productName || '',
    quantity,
    unitCost,
    totalAmount,
    paidAmount,
    paymentStatus,
    purchaseDate: todayISO(),
    notes,
  });

  if (product && quantity > 0) {
    await addProductStock({
      businessId: req.businessId,
      productId,
      quantity,
      type: 'purchase',
      reason: `Purchase from ${vendor.name}`,
      reference: purchase._id.toString(),
      staffName: req.user?.name,
    });
    if (unitCost) {
      product.costPrice = unitCost;
      product.vendorName = vendor.name;
      await product.save();
    }
  }

  if (totalAmount > paidAmount) {
    vendor.outstandingBalance = (vendor.outstandingBalance || 0) + (totalAmount - paidAmount);
    await vendor.save();
  }

  res.status(201).json({ success: true, purchase: purchase.toPublicJSON() });
});

export const listStockLogs = asyncHandler(async (req, res) => {
  const logs = await StationeryStockLog.find({ businessId: req.businessId }).sort({ date: -1 }).limit(200);
  const products = await Product.find({ businessId: req.businessId });
  const lowStock = products
    .filter((p) => p.stock <= p.minStockLevel)
    .map((p) => ({
      ...p.toPublicJSON(),
      suggestedReorder: Math.max(p.minStockLevel * 2 - p.stock, p.minStockLevel),
    }));
  res.json({ logs: logs.map((l) => l.toPublicJSON()), lowStock, products: products.map((p) => p.toPublicJSON()) });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const { productId, quantity, type, reason } = req.body;
  const qty = Number(quantity);
  if (!productId || !qty) return res.status(400).json({ error: 'Product and quantity required' });

  let product;
  if (['wastage', 'adjustment'].includes(type) && qty < 0) {
    product = await deductProductStock({
      businessId: req.businessId,
      productId,
      quantity: Math.abs(qty),
      type: type === 'wastage' ? 'wastage' : 'adjustment',
      reference: reason,
      staffName: req.user?.name,
    });
  } else if (type === 'return' || qty > 0) {
    product = await addProductStock({
      businessId: req.businessId,
      productId,
      quantity: Math.abs(qty),
      type: type || 'adjustment',
      reason,
      reference: reason,
      staffName: req.user?.name,
    });
  }

  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, product: product.toPublicJSON() });
});

export const getReports = asyncHandler(async (req, res) => {
  const businessId = req.businessId;
  const type = req.params.type;
  const [invoices, products, schoolOrders] = await Promise.all([
    Invoice.find({ businessId, status: 'paid' }),
    Product.find({ businessId }),
    SchoolOrder.find({ businessId }),
  ]);

  if (type === 'daily-sales') {
    const cash = invoices.filter((i) => String(i.paymentMethod).toLowerCase().includes('cash')).reduce((s, i) => s + i.grandTotal, 0);
    const upi = invoices.filter((i) => String(i.paymentMethod).toLowerCase().includes('upi')).reduce((s, i) => s + i.grandTotal, 0);
    const card = invoices.filter((i) => String(i.paymentMethod).toLowerCase().includes('card')).reduce((s, i) => s + i.grandTotal, 0);
    return res.json({ report: { cash, upi, card, total: cash + upi + card } });
  }

  if (type === 'product-sales') {
    const salesMap = {};
    for (const inv of invoices) {
      for (const item of inv.items || []) {
        if (item.itemType === 'service') continue;
        const key = item.description;
        salesMap[key] = (salesMap[key] || 0) + (item.quantity || 0);
      }
    }
    const topSelling = Object.entries(salesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, qty]) => ({ name, qty }));
    const slowMoving = products
      .filter((p) => p.stock > p.minStockLevel * 2)
      .slice(0, 10)
      .map((p) => ({ name: p.name, stock: p.stock, category: p.category }));
    return res.json({ report: { topSelling, slowMoving } });
  }

  if (type === 'stock') {
    return res.json({
      report: {
        current: products.map((p) => p.toPublicJSON()),
        lowStock: products.filter((p) => p.stock <= p.minStockLevel && p.stock > 0).map((p) => p.toPublicJSON()),
        outOfStock: products.filter((p) => p.stock <= 0).map((p) => p.toPublicJSON()),
      },
    });
  }

  if (type === 'xerox') {
    let bw = 0;
    let color = 0;
    let lamination = 0;
    let revenue = 0;
    for (const inv of invoices) {
      for (const item of inv.items || []) {
        if (item.itemType !== 'service') continue;
        revenue += item.amount || 0;
        const st = String(item.serviceType || item.description || '').toLowerCase();
        const pages = item.pages || item.quantity || 0;
        if (st.includes('color')) color += pages;
        else if (st.includes('b&w') || st.includes('black')) bw += pages;
        if (st.includes('lamination')) lamination += 1;
      }
    }
    return res.json({ report: { bw, color, lamination, revenue } });
  }

  if (type === 'school-orders') {
    return res.json({
      report: {
        pending: schoolOrders.filter((o) => ['Quotation', 'Confirmed', 'Packed'].includes(o.status)),
        delivered: schoolOrders.filter((o) => o.status === 'Delivered'),
        unpaid: schoolOrders.filter((o) => o.status !== 'Paid'),
      },
    });
  }

  res.status(404).json({ error: 'Unknown report type' });
});

export const getStationerySettings = asyncHandler(async (req, res) => {
  const business = req.business || (await Business.findById(req.businessId));
  const settings = business?.stationerySettings || {
    thermalInvoice: true,
    defaultGstMode: 'inclusive',
    enableBarcodeScanning: true,
    enableStockWarning: true,
    enableWhatsAppSharing: true,
    invoiceFooter: 'Thank you for shopping with us!',
  };
  res.json({
    settings,
    business: {
      name: business?.name,
      tradeName: business?.tradeName,
      gstin: business?.gstin || business?.GSTNumber,
      phone: business?.phone,
      address: business?.address,
      logo: business?.branding?.logo || business?.logo,
    },
  });
});

export const updateStationerySettings = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.businessId);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  business.stationerySettings = { ...(business.stationerySettings || {}), ...req.body.settings };
  if (req.body.business) {
    const b = req.body.business;
    if (b.name) business.name = b.name;
    if (b.tradeName) business.tradeName = b.tradeName;
    if (b.gstin) {
      business.gstin = b.gstin;
      business.GSTNumber = b.gstin;
    }
    if (b.phone) business.phone = b.phone;
    if (b.address) business.address = { ...business.address, ...b.address };
    if (b.logo) business.branding = { ...(business.branding || {}), logo: b.logo };
    if (b.invoiceFooter) business.stationerySettings.invoiceFooter = b.invoiceFooter;
  }
  await business.save();
  res.json({ success: true, settings: business.stationerySettings });
});

export const seedStationeryDemo = asyncHandler(async (req, res) => {
  const businessId = req.businessId;
  const existing = await Product.countDocuments({ businessId });
  if (existing > 5) return res.json({ success: true, message: 'Already seeded' });

  const categories = ['Notebooks', 'Pens', 'Pencils', 'Geometry Box', 'Printing Paper', 'Xerox Paper'];
  const products = [
    { name: 'Classmate A4 Notebook 172pp', sku: 'NB-A4-172', barcode: '8901030590123', category: 'Notebooks', brand: 'Classmate', unit: 'pc', costPrice: 35, sellingPrice: 55, gstRate: 12, stock: 120, minStockLevel: 30, vendorName: 'ITC Ltd' },
    { name: 'Reynolds Trimax Pen Blue', sku: 'PEN-TRI-BL', barcode: '8901030590456', category: 'Pens', brand: 'Reynolds', unit: 'pc', costPrice: 12, sellingPrice: 20, gstRate: 12, stock: 200, minStockLevel: 50, vendorName: 'Reynolds India' },
    { name: 'Nataraj 621 Pencil HB', sku: 'PEN-NAT-HB', barcode: '8901030590789', category: 'Pencils', brand: 'Nataraj', unit: 'pc', costPrice: 3, sellingPrice: 5, gstRate: 12, stock: 500, minStockLevel: 100, vendorName: 'Hindustan Pencils' },
    { name: 'Camlin Geometry Box', sku: 'GEO-CAM-01', barcode: '8901030591112', category: 'Geometry Box', brand: 'Camlin', unit: 'pc', costPrice: 65, sellingPrice: 99, gstRate: 12, stock: 45, minStockLevel: 15, vendorName: 'Camlin Ltd' },
    { name: 'JK Copier A4 75gsm (500 sheets)', sku: 'PAP-JK-A4', barcode: '8901030591445', category: 'Printing Paper', brand: 'JK', unit: 'ream', costPrice: 180, sellingPrice: 260, gstRate: 12, stock: 25, minStockLevel: 10, vendorName: 'JK Paper' },
    { name: 'Navneet Drawing Book A4', sku: 'ART-NAV-A4', barcode: '8901030591778', category: 'Art & Craft', brand: 'Navneet', unit: 'pc', costPrice: 28, sellingPrice: 45, gstRate: 12, stock: 8, minStockLevel: 20, vendorName: 'Navneet Education' },
  ];

  const created = await Product.insertMany(products.map((p) => ({ businessId, ...p })));

  const comboProducts = created.slice(0, 4);
  await ProductCombo.create({
    businessId,
    name: 'Class 5 Starter Kit',
    sku: 'COMBO-CLS5',
    sellingPrice: 299,
    gstRate: 12,
    items: [
      { productId: comboProducts[0]._id, quantity: 5 },
      { productId: comboProducts[1]._id, quantity: 2 },
      { productId: comboProducts[2]._id, quantity: 2 },
      { productId: comboProducts[3]._id, quantity: 1 },
    ],
  });

  res.json({ success: true, products: created.length });
});
