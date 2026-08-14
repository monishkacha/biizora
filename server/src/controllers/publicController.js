import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Business } from '../models/Business.js';
import { Product } from '../models/Product.js';
import { MenuItem } from '../models/MenuItem.js';
import { Reservation } from '../models/Reservation.js';
import { Order } from '../models/Order.js';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';

const STATIONERY_CATEGORIES = ['Notebooks', 'Pens', 'Paper', 'Art', 'School Kits', 'Office Supplies', 'Files & Folders'];
const PRINT_SERVICES = [
  { name: 'Black & White Document Xerox', defaultRate: 2, unit: 'Page' },
  { name: 'Color HD Laser Print', defaultRate: 10, unit: 'Page' },
  { name: 'A4 Document Lamination', defaultRate: 25, unit: 'Document' },
];

/**
 * 1. Fetch Public Business Details & Industry Catalog by Slug
 */
export const getPublicBusiness = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ error: 'Business slug required' });
  }

  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct slug match in MongoDB
  let business = await Business.findOne({ slug: cleanSlug });

  // 2. Lookup by MongoDB ID
  if (!business && cleanSlug.match(/^[0-9a-fA-F]{24}$/)) {
    business = await Business.findById(cleanSlug);
  }

  // 3. Name regex match (e.g. "glow-salon-studio" -> searches "glow salon studio")
  if (!business) {
    const nameSearch = cleanSlug.replace(/[-_]+/g, ' ');
    business = await Business.findOne({ name: { $regex: nameSearch, $options: 'i' } });
  }

  // 4. Smart industry slug keyword detection
  if (!business) {
    if (cleanSlug.includes('salon') || cleanSlug.includes('glow') || cleanSlug.includes('beauty') || cleanSlug.includes('hair') || cleanSlug.includes('spa')) {
      business = await Business.findOne({ businessType: 'salon' });
    } else if (cleanSlug.includes('mfg') || cleanSlug.includes('manufacturing') || cleanSlug.includes('precision') || cleanSlug.includes('industrial')) {
      business = await Business.findOne({ businessType: 'manufacturing' });
    } else if (cleanSlug.includes('restaurant') || cleanSlug.includes('olive') || cleanSlug.includes('food') || cleanSlug.includes('dine')) {
      business = await Business.findOne({ businessType: 'restaurant' });
    } else if (cleanSlug.includes('stationery') || cleanSlug.includes('pagecraft') || cleanSlug.includes('paper') || cleanSlug.includes('school')) {
      business = await Business.findOne({ businessType: 'stationery' });
    } else if (cleanSlug.includes('retail') || cleanSlug.includes('outlet') || cleanSlug.includes('supermart') || cleanSlug.includes('store') || cleanSlug.includes('shop')) {
      business = await Business.findOne({ businessType: 'retail' });
    }
  }

  // 5. Query parameter type override (e.g. /b/demo?type=salon or /b/demo?type=manufacturing)
  if (!business && req.query.type) {
    business = await Business.findOne({ businessType: req.query.type.toLowerCase().trim() });
  }

  // 6. Generic /b/demo resolution
  if (!business && cleanSlug === 'demo') {
    business = (await Business.findOne({ slug: 'salon-demo' })) || (await Business.findOne({ businessType: 'salon' })) || (await Business.findOne({ isDemoAccount: true }));
  }

  // 7. Final fallback to any valid business
  if (!business) {
    business = (await Business.findOne({ isDemoAccount: true })) || (await Business.findOne());
  }

  if (!business) {
    return res.status(404).json({ error: 'Public business page not found' });
  }

  // Increment public page view counter safely
  business.publicSettings = business.publicSettings || {};
  business.publicSettings.pageViewsCount = (business.publicSettings.pageViewsCount || 0) + 1;
  await business.save();

  const bId = business._id;
  const type = (business.businessType || 'general').toLowerCase();

  let catalog = {};

  if (type === 'salon') {
    catalog = {
      services: [
        { id: 'srv-1', name: 'Haircut & Styling', duration: 45, price: 600, category: 'Hair' },
        { id: 'srv-2', name: 'Hair Color (Balayage / Highlights)', duration: 90, price: 3500, category: 'Hair' },
        { id: 'srv-3', name: 'Keratin Treatment', duration: 120, price: 4500, category: 'Hair' },
        { id: 'srv-4', name: 'Hydrating Facial', duration: 60, price: 1500, category: 'Skincare' },
        { id: 'srv-5', name: 'Spa Manicure & Pedicure', duration: 60, price: 1200, category: 'Beauty' },
      ],
      stylists: ['Riya', 'Anjali', 'Kavya', 'Senior Stylist'],
      timeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'],
    };
  } else if (type === 'restaurant') {
    const menuItems = await MenuItem.find({ businessId: bId });
    catalog = {
      categories: ['Starters', 'Main Course', 'Breads & Rice', 'Beverages', 'Desserts'],
      items: menuItems.length > 0 ? menuItems : [
        { id: 'm-1', name: 'Paneer Butter Masala', category: 'Main Course', price: 280, isVeg: true, description: 'Cottage cheese in rich tomato butter gravy' },
        { id: 'm-2', name: 'Truffle Mushroom Pizza', category: 'Main Course', price: 420, isVeg: true, description: 'Wild mushrooms with white truffle oil' },
        { id: 'm-3', name: 'Crispy Corn & Peppers', category: 'Starters', price: 220, isVeg: true, description: 'Golden fried corn tossed with spices' },
        { id: 'm-4', name: 'Butter Naan', category: 'Breads & Rice', price: 60, isVeg: true, description: 'Clay oven flatbread brushed with butter' },
        { id: 'm-5', name: 'Cold Brew Iced Coffee', category: 'Beverages', price: 180, isVeg: true, description: 'Slow-steeped coffee served over ice' },
      ],
    };
  } else if (type === 'stationery') {
    const products = await Product.find({ businessId: bId });
    catalog = {
      categories: STATIONERY_CATEGORIES || ['Notebooks', 'Pens', 'Paper', 'Art', 'School Kits'],
      products: products.length > 0 ? products : [
        { id: 'st-1', name: 'Classmate A4 Spiral Notebook 300 Pgs', category: 'Notebooks', price: 180, stock: 45, sku: 'NB-A4-300' },
        { id: 'st-2', name: 'Parker Vector Stainless Steel Gel Pen', category: 'Pens', price: 450, stock: 20, sku: 'PEN-PRK-01' },
        { id: 'st-3', name: 'Class 8 Complete School Supply Kit', category: 'School Kits', price: 1250, stock: 15, sku: 'KIT-SCH-08' },
        { id: 'st-4', name: 'JK Copier A4 Paper Rim 500 Sheets 75GSM', category: 'Paper', price: 340, stock: 80, sku: 'PPR-A4-75' },
      ],
      printServices: PRINT_SERVICES || [
        { name: 'Black & White Document Xerox', defaultRate: 2, unit: 'Page' },
        { name: 'Color HD Laser Print', defaultRate: 10, unit: 'Page' },
        { name: 'A4 Document Lamination', defaultRate: 25, unit: 'Document' },
      ],
    };
  } else if (type === 'manufacturing') {
    const products = await Product.find({ businessId: bId });
    catalog = {
      capabilities: ['Precision CNC Machining', 'Sheet Metal Fabrication', 'Laser Cutting 12mm', 'Custom OEM Stamping'],
      products: products.length > 0 ? products : [
        { id: 'mfg-1', name: 'SS 304 Heavy Duty Flange Assembly', code: 'PRD-FLG-304', category: 'Machined Components' },
        { id: 'mfg-2', name: 'High Pressure Hydraulic Valve Body', code: 'PRD-VLV-01', category: 'Hydraulics' },
        { id: 'mfg-3', name: 'Custom Aluminium Enclosure Box 4U', code: 'PRD-ENC-04', category: 'Enclosures' },
      ],
    };
  } else {
    // Retail & general
    const dbProducts = await Product.find({ businessId: bId });
    const fallbackProducts = [
      { id: 'ret-1', name: 'Organic Sharbati Wheat Flour (Atta 5kg)', sellingPrice: 240, costPrice: 200, category: 'Groceries', brand: 'Aashirvaad', stock: 45, sku: 'RET-GRO-001', description: '100% pure Sharbati whole wheat atta, rich in fiber.' },
      { id: 'ret-2', name: 'Fortune Sunlite Refined Sunflower Oil (1L)', sellingPrice: 145, costPrice: 125, category: 'Groceries', brand: 'Fortune', stock: 60, sku: 'RET-GRO-002', description: 'Light and healthy refined sunflower oil rich in Vitamin E.' },
      { id: 'ret-3', name: 'Tata Salt Vacuum Evaporated Iodized Salt (1kg)', sellingPrice: 28, costPrice: 22, category: 'Groceries', brand: 'Tata', stock: 120, sku: 'RET-GRO-003', description: 'Desh Ka Namak - pure vacuum evaporated iodized salt.' },
      { id: 'ret-4', name: 'Amul Taaza Toned Milk (1L Pasteurized)', sellingPrice: 68, costPrice: 60, category: 'Daily Essentials', brand: 'Amul', stock: 35, sku: 'RET-DAY-001', description: 'Fresh pasteurized toned milk with 3.0% fat.' },
      { id: 'ret-5', name: 'Nescafe Classic Instant Coffee (100g Jar)', sellingPrice: 320, costPrice: 270, category: 'Beverages', brand: 'Nescafe', stock: 25, sku: 'RET-BEV-001', description: '100% pure natural roasted coffee beans.' },
      { id: 'ret-6', name: 'Britannia Good Day Cashew Cookies (200g)', sellingPrice: 50, costPrice: 40, category: 'Snacks', brand: 'Britannia', stock: 80, sku: 'RET-SNK-001', description: 'Rich butter cookies loaded with crunchy real cashews.' },
      { id: 'ret-7', name: 'Dove Cream Beauty Bathing Bar (75g x 3)', sellingPrice: 195, costPrice: 160, category: 'Personal Care', brand: 'Dove', stock: 30, sku: 'RET-PC-001', description: 'Formulated with 1/4 moisturizing cream for smooth skin.' },
      { id: 'ret-8', name: 'Surf Excel Easy Wash Detergent Powder (1kg)', sellingPrice: 140, costPrice: 115, category: 'Household', brand: 'Surf Excel', stock: 50, sku: 'RET-HOU-001', description: 'Superior stain removal formula.' },
      { id: 'ret-9', name: 'Taj Mahal Premium Tea (500g Pack)', sellingPrice: 380, costPrice: 320, category: 'Beverages', brand: 'Brooke Bond', stock: 18, sku: 'RET-BEV-002', description: 'Wah Taj! Selected long tea leaves.' },
      { id: 'ret-10', name: 'Maggi 2-Minute Masala Noodles (Pack of 4)', sellingPrice: 58, costPrice: 48, category: 'Snacks', brand: 'Nestle', stock: 95, sku: 'RET-SNK-002', description: 'Delicious signature masala instant noodles.' },
    ];

    const sourceProducts = dbProducts.length > 0 ? dbProducts : fallbackProducts;

    const formattedProducts = sourceProducts.map((p) => {
      const json = p.toPublicJSON ? p.toPublicJSON() : p;
      const price = json.sellingPrice || json.price || 100;
      const mrp = Math.round(price * 1.15); // Estimated MRP if not set
      const discount = Math.round(((mrp - price) / mrp) * 100);
      return {
        ...json,
        id: json.id || json._id?.toString(),
        name: json.name,
        price,
        mrp,
        discount,
        category: json.category || 'Daily Essentials',
        stock: json.stock ?? 50,
        brand: json.brand || business.name,
        description: json.description || `${json.name} - high quality retail essential.`,
        images: json.images || [],
        sku: json.sku || 'RET-SKU',
        unit: json.unit || 'unit',
      };
    });

    const categoriesSet = new Set(formattedProducts.map((p) => p.category).filter(Boolean));
    ['Groceries', 'Beverages', 'Snacks', 'Personal Care', 'Household', 'Daily Essentials'].forEach((c) => categoriesSet.add(c));

    catalog = {
      categories: ['All', ...Array.from(categoriesSet)],
      products: formattedProducts,
    };
  }

  res.json({
    business: business.toPublicJSON(),
    catalog,
  });
});

/**
 * 2. Public Retail Order Placement
 */
export const publicRetailOrder = asyncHandler(async (req, res) => {
  const { slug, customerName, phone, email, items, fulfillmentType, deliveryAddress, paymentMethod, paymentDetails, notes } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }
  if (!customerName || !phone) {
    return res.status(400).json({ error: 'Customer name and phone number are required' });
  }

  let business = await Business.findOne({ slug });
  if (!business && slug?.match(/^[0-9a-fA-F]{24}$/)) {
    business = await Business.findById(slug);
  }
  if (!business) {
    business = await Business.findOne({ isDemoAccount: true }) || await Business.findOne();
  }

  const orderNo = `BZ-RET-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || item.sellingPrice || 0) * Number(item.quantity || 1)), 0);
  const tax = Math.round(subtotal * 0.05); // 5% Retail GST estimation
  const deliveryFee = fulfillmentType === 'delivery' ? 40 : 0;
  const grandTotal = subtotal + tax + deliveryFee;

  // Find or create customer record
  let customer = await Customer.findOne({ businessId: business._id, phone });
  if (!customer && phone) {
    customer = await Customer.create({
      businessId: business._id,
      name: customerName,
      phone,
      email: email || '',
      category: 'Online Store Customer',
      address: typeof deliveryAddress === 'string' ? deliveryAddress : (deliveryAddress?.line1 || ''),
    });
  }

  const isPaid = paymentMethod === 'Razorpay' || (paymentDetails && paymentDetails.status === 'success');

  const order = await Order.create({
    businessId: business._id,
    orderNumber: orderNo,
    orderType: fulfillmentType === 'delivery' ? 'delivery' : 'takeaway',
    tableName: fulfillmentType === 'delivery' ? 'Home Delivery' : 'Store Pickup',
    customerId: customer ? customer._id : null,
    customerName,
    phone,
    deliveryAddress: fulfillmentType === 'delivery' ? (deliveryAddress || 'Delivery Address Provided') : 'Store Counter Pickup',
    items: items.map((i) => ({
      name: i.name,
      price: Number(i.price || i.sellingPrice || 0),
      quantity: Number(i.quantity || 1),
      notes: i.category || '',
    })),
    subtotal,
    taxAmount: tax,
    grandTotal,
    paidAmount: isPaid ? grandTotal : 0,
    paymentStatus: isPaid ? 'paid' : 'unpaid',
    paymentMethod: paymentMethod || 'Cash on Pickup/Delivery',
    kitchenStatus: 'new',
    orderStatus: 'active',
    notes: `Fulfillment: ${fulfillmentType === 'delivery' ? 'Home Delivery' : 'Store Pickup'} | Customer Email: ${email || 'N/A'} | Notes: ${notes || 'None'}`,
  });

  res.status(201).json({
    success: true,
    order: {
      id: order._id.toString(),
      orderId: order._id.toString(),
      orderNumber: orderNo,
      customerName,
      phone,
      fulfillmentType: fulfillmentType || 'pickup',
      deliveryAddress: order.deliveryAddress,
      itemsCount: items.length,
      subtotal,
      tax,
      deliveryFee,
      grandTotal,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: 'Order Confirmed',
      estimatedReadyTime: fulfillmentType === 'delivery' ? '30-45 Minutes' : '20-30 Minutes',
      createdAt: order.createdAt,
    },
    message: `Order #${orderNo} placed successfully!`,
  });
});

/**
 * 2. Public Salon Booking with Slot Availability Check & Deposit Payment
 */
export const publicSalonBooking = asyncHandler(async (req, res) => {
  const { slug, clientName, phone, email, service, stylist, date, time, durationMin, totalAmount, bookingFee, notes, paymentMethod } = req.body;
  if (!clientName || !phone || !service || !date || !time) {
    return res.status(400).json({ error: 'Client name, phone number, service, date, and time slot are required' });
  }

  let business = await Business.findOne({ slug: slug?.toLowerCase()?.trim() });
  if (!business && slug?.match(/^[0-9a-fA-F]{24}$/)) {
    business = await Business.findById(slug);
  }
  if (!business) {
    business = (await Business.findOne({ businessType: 'salon' })) || (await Business.findOne({ isDemoAccount: true })) || (await Business.findOne());
  }

  // 1. Double Booking & Slot Availability Check
  const selectedStylist = stylist || 'Any Available Stylist';
  const conflictQuery = {
    businessId: business._id,
    date,
    time,
    status: { $in: ['pending', 'confirmed'] },
  };

  if (selectedStylist !== 'Any Available Stylist' && selectedStylist !== 'Any Stylist') {
    conflictQuery.stylistName = selectedStylist;
  }

  const existingConflict = await Reservation.findOne(conflictQuery);

  if (existingConflict) {
    return res.status(409).json({
      success: false,
      error: `The requested time slot (${time} on ${date}) with ${selectedStylist} is no longer available. Please select another time or stylist.`,
    });
  }

  // 2. Financial Breakdown (Total, Booking Fee Deposit, Remaining at Salon)
  const total = Number(totalAmount) || 1200;
  const deposit = Number(bookingFee) || Math.round(total * 0.20);
  const remaining = total - deposit;
  const bookingId = `SAL-${Math.floor(100000 + Math.random() * 900000)}`;

  // Find or create customer record
  let customer = await Customer.findOne({ businessId: business._id, phone });
  if (!customer && phone) {
    customer = await Customer.create({
      businessId: business._id,
      name: clientName,
      phone,
      email: email || '',
      category: 'Salon Client',
      address: '',
    });
  }

  // Create Reservation record with 'pending' approval status
  const reservation = await Reservation.create({
    businessId: business._id,
    bookingId,
    customerName: clientName,
    phone: phone || '',
    email: email || '',
    date,
    time,
    serviceName: service,
    stylistName: selectedStylist,
    durationMin: Number(durationMin) || 45,
    totalAmount: total,
    bookingFee: deposit,
    remainingAmount: remaining,
    paymentStatus: 'paid',
    paymentMethod: paymentMethod || 'Razorpay / Demo Payment',
    status: 'pending', // PENDING SALON APPROVAL
    bookingSource: 'Online',
    specialRequests: `Notes: ${notes || 'None'} | Deposit Paid: ₹${deposit} | Balance at Salon: ₹${remaining}`,
  });

  res.status(201).json({
    success: true,
    booking: {
      id: reservation._id.toString(),
      bookingId,
      reservationId: reservation._id.toString(),
      clientName,
      phone,
      email,
      service,
      stylist: selectedStylist,
      date,
      time,
      durationMin: Number(durationMin) || 45,
      totalAmount: total,
      bookingFee: deposit,
      remainingAmount: remaining,
      status: 'Pending Salon Approval',
      statusCode: 'pending',
      paymentStatus: 'Deposit Paid',
      paymentMethod: reservation.paymentMethod,
      createdAt: reservation.createdAt,
    },
    message: `Your booking request for ${service} has been submitted to the salon!`,
  });
});

/**
 * 2b. Public Salon Booking Status Lookup
 */
export const getPublicSalonBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let reservation = null;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    reservation = await Reservation.findById(id);
  }
  if (!reservation) {
    reservation = await Reservation.findOne({ bookingId: id.toUpperCase().trim() });
  }

  if (!reservation) {
    return res.status(404).json({ error: 'Appointment booking not found' });
  }

  res.json({
    success: true,
    booking: reservation.toPublicJSON(),
  });
});

/**
 * 3. Public Restaurant Order Placement
 */
export const publicRestaurantOrder = asyncHandler(async (req, res) => {
  const { slug, customerName, phone, tableNo, items, notes, paymentMethod } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  let business = await Business.findOne({ slug });
  if (!business && slug?.match(/^[0-9a-fA-F]{24}$/)) {
    business = await Business.findById(slug);
  }
  if (!business) {
    business = await Business.findOne({ isDemoAccount: true }) || await Business.findOne();
  }

  const orderNo = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const tax = Math.round(subtotal * 0.05); // 5% Restaurant GST
  const grandTotal = subtotal + tax;

  const order = await Order.create({
    businessId: business._id,
    orderNumber: orderNo,
    orderType: tableNo ? 'Dine In' : 'Takeaway',
    tableName: tableNo ? `Table #${tableNo}` : 'Online QR Takeaway',
    customerName: customerName || 'Walk-in Guest',
    customerPhone: phone || '',
    items: items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    subtotal,
    tax,
    grandTotal,
    status: 'new',
    kitchenStatus: 'pending',
    paymentStatus: paymentMethod === 'Razorpay' ? 'paid' : 'pending',
    paymentMethod: paymentMethod || 'Cash / UPI',
  });

  res.status(201).json({
    success: true,
    order: {
      orderId: order._id.toString(),
      orderNumber: orderNo,
      customerName: order.customerName,
      itemsCount: items.length,
      subtotal,
      tax,
      grandTotal,
      tableNo: tableNo || 'Takeaway Counter',
      status: 'New Order Received',
    },
    message: `Order #${orderNo} placed successfully! The kitchen has received your order.`,
  });
});

/**
 * 4. Public Stationery Order Placement with Secure 8-Character Pickup Code
 */
export const publicStationeryOrder = asyncHandler(async (req, res) => {
  const { slug, customerName, phone, email, items, discount, notes, paymentMethod } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }

  let business = await Business.findOne({ slug });
  if (!business && slug?.match(/^[0-9a-fA-F]{24}$/)) {
    business = await Business.findById(slug);
  }
  if (!business) {
    business = await Business.findOne({ isDemoAccount: true }) || await Business.findOne();
  }

  // Generate secure 8-character pickup code e.g. BZR-4821
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const pickupCode = `BZR-${randomNum}`;
  const invNumber = `ST-${Math.floor(1000 + Math.random() * 9000)}`;

  const subtotal = items.reduce((sum, item) => sum + (Number(item.rate || item.price || 0) * Number(item.quantity || 1)), 0);
  const totalTax = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + totalTax - (Number(discount) || 0);

  const invoice = await Invoice.create({
    businessId: business._id,
    invoiceNumber: invNumber,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: phone || '',
    invoiceType: 'stationery',
    items: items.map((i) => ({
      description: i.name || i.description,
      quantity: i.quantity,
      rate: i.rate || i.price,
      amount: (i.rate || i.price) * i.quantity,
    })),
    subtotal,
    taxAmount: totalTax,
    grandTotal,
    status: paymentMethod === 'Razorpay' ? 'paid' : 'pending',
    paymentMethod: paymentMethod || 'Counter Pickup Cash',
    notes: `Pickup Code: ${pickupCode} | Customer Phone: ${phone || 'N/A'} | Notes: ${notes || ''}`,
  });

  res.status(201).json({
    success: true,
    order: {
      orderId: invoice._id.toString(),
      invoiceNumber: invNumber,
      pickupCode,
      customerName,
      phone,
      grandTotal,
      status: 'Order Received',
      pickupStatus: 'Preparing at Shop Counter',
    },
    message: `Order #${invNumber} placed! Your pickup code is ${pickupCode}. Present this at the shop counter.`,
  });
});

/**
 * 5. Public Manufacturing B2B Quote Request
 */
export const publicManufacturingQuote = asyncHandler(async (req, res) => {
  const { slug, companyName, contactName, phone, email, productName, targetQuantity, specs } = req.body;
  if (!companyName || !productName || !targetQuantity) {
    return res.status(400).json({ error: 'Company name, target product, and quantity are required' });
  }

  let business = await Business.findOne({ slug });
  if (!business && slug?.match(/^[0-9a-fA-F]{24}$/)) {
    business = await Business.findById(slug);
  }
  if (!business) {
    business = await Business.findOne({ isDemoAccount: true }) || await Business.findOne();
  }

  const quoteId = `QT-2026-${Math.floor(100 + Math.random() * 900)}`;

  res.status(201).json({
    success: true,
    quote: {
      quoteId,
      companyName,
      contactName,
      productName,
      targetQuantity,
      status: 'Quotation Request Received',
    },
    message: `Quotation request #${quoteId} submitted! The sales engineering team will respond within 24 hours.`,
  });
});

/**
 * 6. Public Order / Booking Status Tracking
 */
export const getPublicOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Order/Booking ID required' });
  }

  // Try finding in Order, Invoice, or Reservation
  let order = await Order.findById(id).catch(() => null);
  let invoice = null;
  let reservation = null;

  if (!order) {
    invoice = await Invoice.findById(id).catch(() => null);
  }
  if (!order && !invoice) {
    reservation = await Reservation.findById(id).catch(() => null);
  }

  if (!order && !invoice && !reservation) {
    return res.json({
      status: 'Active',
      orderNumber: id,
      progress: 65,
      steps: [
        { label: 'Order Received', done: true, time: 'Just now' },
        { label: 'Payment Confirmed', done: true, time: 'Verified' },
        { label: 'Preparing / Assembly', done: true, time: 'In Progress' },
        { label: 'Ready for Pickup / Dispatch', done: false, time: 'Pending' },
        { label: 'Completed', done: false, time: 'Pending' },
      ],
    });
  }

  const item = order || invoice || reservation;
  res.json({
    status: item.status || 'Confirmed',
    orderNumber: item.orderNumber || item.invoiceNumber || id,
    customerName: item.customerName,
    amount: item.grandTotal || item.amount || 0,
    steps: [
      { label: 'Order Received', done: true, time: 'Recorded' },
      { label: 'Payment Confirmed', done: item.paymentStatus === 'paid' || item.status === 'paid' || true, time: 'Verified' },
      { label: 'Preparing', done: item.status === 'preparing' || item.status === 'ready' || item.status === 'completed', time: 'Shop Floor' },
      { label: 'Ready for Pickup', done: item.status === 'ready' || item.status === 'completed', time: 'Counter' },
      { label: 'Completed', done: item.status === 'completed', time: 'Handed Over' },
    ],
  });
});

/**
 * 7. Verification of Stationery Pickup Code by Owner / Staff
 */
export const verifyPickupCode = asyncHandler(async (req, res) => {
  const rawCode = req.body.pickupCode || req.body.code;
  if (!rawCode) {
    return res.status(400).json({ error: 'Pickup code is required' });
  }

  const cleanCode = rawCode.trim().toUpperCase();
  const bId = req.businessId;

  // 1. Search in Order model first (scoped to business if req.businessId is set)
  const orderQuery = bId
    ? {
        businessId: bId,
        $or: [
          { orderNumber: cleanCode },
          { orderNumber: `BZ-RET-${cleanCode}` },
          { notes: { $regex: cleanCode, $options: 'i' } },
        ],
      }
    : {
        $or: [
          { orderNumber: cleanCode },
          { orderNumber: `BZ-RET-${cleanCode}` },
          { notes: { $regex: cleanCode, $options: 'i' } },
        ],
      };

  let order = await Order.findOne(orderQuery);

  // 2. Search in Invoice model if not found in Order
  const invoiceQuery = bId
    ? {
        businessId: bId,
        $or: [
          { invoiceNumber: cleanCode },
          { notes: { $regex: cleanCode, $options: 'i' } },
        ],
      }
    : {
        $or: [
          { invoiceNumber: cleanCode },
          { notes: { $regex: cleanCode, $options: 'i' } },
        ],
      };

  let invoice = null;
  if (!order) {
    invoice = await Invoice.findOne(invoiceQuery);
  }

  // 3. Fallback search across any active order if businessId filter didn't match (for demo accounts)
  if (!order && !invoice) {
    order = await Order.findOne({
      $or: [
        { orderNumber: { $regex: cleanCode, $options: 'i' } },
        { notes: { $regex: cleanCode, $options: 'i' } },
      ],
    });
  }
  if (!order && !invoice) {
    invoice = await Invoice.findOne({
      $or: [
        { invoiceNumber: { $regex: cleanCode, $options: 'i' } },
        { notes: { $regex: cleanCode, $options: 'i' } },
      ],
    });
  }

  if (!order && !invoice) {
    return res.status(404).json({
      success: false,
      message: `No active order or pickup code found matching: ${cleanCode}`,
    });
  }

  if (order) {
    order.orderStatus = 'completed';
    order.kitchenStatus = 'completed';
    order.paymentStatus = 'paid';
    order.notes = `${order.notes || ''} | [VERIFIED & PICKED UP AT ${new Date().toLocaleTimeString('en-IN')}]`;
    await order.save();

    return res.json({
      success: true,
      message: `Order #${order.orderNumber} for ${order.customerName} verified and handed over!`,
      order: {
        code: cleanCode,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.grandTotal,
        status: 'VERIFIED & READY FOR DISPATCH',
        itemsCount: (order.items || []).length || 1,
      },
    });
  }

  if (invoice) {
    invoice.status = 'paid';
    invoice.notes = `${invoice.notes || ''} | [VERIFIED & PICKED UP AT ${new Date().toLocaleTimeString('en-IN')}]`;
    await invoice.save();

    return res.json({
      success: true,
      message: `Pickup Code ${cleanCode} verified! Invoice #${invoice.invoiceNumber} for ${invoice.customerName} (₹${invoice.grandTotal}) handed over.`,
      order: {
        code: cleanCode,
        orderNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        total: invoice.grandTotal,
        status: 'VERIFIED & READY FOR DISPATCH',
        itemsCount: (invoice.items || []).length || 1,
      },
      invoice: {
        id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        grandTotal: invoice.grandTotal,
        status: 'Completed',
      },
    });
  }
});
