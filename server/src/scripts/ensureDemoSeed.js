import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { Membership } from '../models/Membership.js';
import { Customer } from '../models/Customer.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { Expense } from '../models/Expense.js';
import { Notification } from '../models/Notification.js';
import { getPermissionsForRole } from '../services/permissionDefaults.js';
import { resolveDefaultModules } from '../config/businessTypes.js';

/** Legacy admin demo (single business only) */
export const DEMO_EMAIL = 'adrian.hale@biizora.demo';
export const DEMO_PASSWORD = 'demo1234';

/** Industry demos — each is a separate account with exactly one business */
export const INDUSTRY_DEMOS = [
  {
    email: 'retail-demo@biizora.com',
    password: 'demo123',
    name: 'Retail Demo',
    businessName: 'Apex Retail Outlet',
    businessType: 'retail',
    customFeatures: ['BarcodeScanner', 'SalesForecast', 'InventoryPrediction'],
    plan: 'enterprise',
    isDemoAccount: true,
  },
  {
    email: 'salon-demo@biizora.com',
    password: 'demo123',
    name: 'Salon Demo',
    businessName: 'Glow Salon Studio',
    businessType: 'salon',
    customFeatures: ['AIAppointmentSuggestions', 'CustomerLoyalty', 'SmartScheduling'],
    plan: 'enterprise',
    isDemoAccount: true,
  },
  {
    email: 'restaurant-demo@biizora.com',
    password: 'demo123',
    name: 'Restaurant Demo',
    businessName: 'Spice Route Kitchen',
    businessType: 'restaurant',
    customFeatures: ['KitchenAnalytics', 'PeakHourPrediction', 'TableReservationAI'],
    plan: 'enterprise',
    isDemoAccount: true,
  },
  {
    email: 'manufacturing-demo@biizora.com',
    password: 'demo123',
    name: 'Manufacturing Demo',
    businessName: 'Precision Works MFG',
    businessType: 'manufacturing',
    customFeatures: ['ProductionDashboard', 'MachineMonitoring', 'QualityReports'],
    plan: 'enterprise',
    isDemoAccount: true,
  },
  {
    email: 'stationery-demo@biizora.com',
    password: 'demo123',
    name: 'Stationery Demo',
    businessName: 'PageCraft Stationery',
    businessType: 'stationery',
    customFeatures: ['BulkSchoolOrders', 'WholesalePricing', 'InventoryAlerts'],
    plan: 'enterprise',
    isDemoAccount: true,
  },
  {
    email: 'fleet-demo@biizora.com',
    password: 'demo123',
    name: 'Fleet Demo',
    businessName: 'FleetFirst Logistics',
    businessType: 'retail',
    customFeatures: ['vehicleTracking', 'SalesForecast'],
    plan: 'enterprise',
    isDemoAccount: true,
  },
];

/**
 * Ensure one-account-one-business demo users exist.
 * Safe to call on every server start.
 */
export async function ensureDemoSeed() {
  await ensureAdrianDemo();
  for (const spec of INDUSTRY_DEMOS) {
    await ensureIndustryDemoAccount(spec);
  }
  console.log('✓ Demo accounts ready (one business per account)');
  console.log(`  Admin: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log('  Industry: retail-demo@biizora.com, salon-demo@biizora.com, restaurant-demo@biizora.com, manufacturing-demo@biizora.com, stationery-demo@biizora.com / demo123');
  return true;
}

async function ensureAdrianDemo() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const legacy = await User.findOne({ email: 'kpatel3360@gmail.com' });
  const existingDemo = await User.findOne({ email: DEMO_EMAIL });
  if (legacy && !existingDemo) {
    legacy.name = 'Adrian Hale';
    legacy.email = DEMO_EMAIL;
    legacy.passwordHash = passwordHash;
    await legacy.save();
  } else if (legacy && existingDemo) {
    await User.deleteOne({ _id: legacy._id });
  }

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({
      name: 'Adrian Hale',
      email: DEMO_EMAIL,
      passwordHash,
      phone: '+91 98765 43210',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Adrian%20Hale',
      isSuperAdmin: true,
      isDemoAccount: true,
      preferences: { theme: 'light', timezone: 'Asia/Kolkata', language: 'en', bgStyle: 'ivory-cream' },
    });
  } else {
    user.passwordHash = passwordHash;
    user.isSuperAdmin = true;
    user.isDemoAccount = true;
    await user.save();
  }

  // Strip legacy multi-business memberships — keep exactly one (Owner preferred)
  const memberships = await Membership.find({ userId: user._id, status: 'active' }).populate('businessId');
  let primary = memberships.find((m) => m.role === 'Owner' && m.businessId) || memberships.find((m) => m.businessId);

  if (memberships.length > 1 && primary) {
    const keepId = primary._id.toString();
    await Membership.deleteMany({
      userId: user._id,
      _id: { $ne: primary._id },
    });
    console.log(`→ Trimmed Adrian Hale to one business (removed ${memberships.length - 1} extras)`);
  }

  let business = primary?.businessId || null;

  if (!business) {
    business = await Business.create({
      name: 'Hale Analytics Group',
      tradeName: 'Hale Analytics',
      ownerName: 'Adrian Hale',
      industry: 'Retail',
      businessType: 'retail',
      gstin: '29ABCDE1234F1Z5',
      GSTNumber: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      email: DEMO_EMAIL,
      phone: '+91 98765 43210',
      website: 'https://biizora.in',
      subscriptionStatus: 'Active',
      subscriptionPlan: 'enterprise',
      subscriptionActivatedAt: new Date(),
      isActive: true,
      isDemoAccount: true,
      enabledModules: resolveDefaultModules('retail'),
      customFeatures: ['BarcodeScanner', 'SalesForecast', 'InventoryPrediction'],
      address: {
        line1: 'Suite 402, Innovate Tech Park, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560095',
        country: 'India',
      },
      taxSettings: {
        currency: 'INR',
        currencySymbol: '₹',
        defaultTaxRate: 18,
        invoicePrefix: 'INV-2026-',
        invoiceTheme: 'modern',
      },
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      invoicePrefix: 'INV-2026-',
      themeColor: '#2F5D50',
      branding: { brandColor: '#2F5D50', primaryColor: '#2F5D50', invoiceTheme: 'modern' },
      onboardingCompleted: true,
      createdBy: user._id,
    });

    await Membership.create({
      userId: user._id,
      businessId: business._id,
      role: 'Owner',
      permissions: getPermissionsForRole('Owner'),
      status: 'active',
    });
  } else {
    business.subscriptionStatus = 'Active';
    business.isActive = true;
    business.isDemoAccount = true;
    business.businessType = business.businessType || 'retail';
    business.subscriptionPlan = 'enterprise';
    business.customFeatures = ['BarcodeScanner', 'SalesForecast', 'InventoryPrediction'];
    business.onboardingCompleted = true;
    if (!business.enabledModules?.length) {
      business.enabledModules = resolveDefaultModules(business.businessType);
    }
    await business.save();
  }

  await Customer.deleteMany({ businessId: business._id });
  await Product.deleteMany({ businessId: business._id });
  await Invoice.deleteMany({ businessId: business._id });
  await Expense.deleteMany({ businessId: business._id });
  await seedDemoRecords(user, business);
  console.log('→ Seeded Adrian Hale sample invoices/customers');
}

async function ensureIndustryDemoAccount(spec) {
  const passwordHash = await bcrypt.hash(spec.password, 12);
  let user = await User.findOne({ email: spec.email });

  if (!user) {
    user = await User.create({
      name: spec.name,
      email: spec.email,
      passwordHash,
      phone: '+91 90000 00000',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(spec.name)}`,
      isDemoAccount: true,
      preferences: { theme: 'light', timezone: 'Asia/Kolkata', language: 'en' },
    });
    console.log(`→ Created demo account ${spec.email}`);
  } else {
    user.passwordHash = passwordHash;
    user.name = spec.name;
    user.isDemoAccount = true;
    await user.save();
  }

  // Enforce one membership
  const memberships = await Membership.find({ userId: user._id, status: 'active' });
  let membership = memberships[0] || null;
  if (memberships.length > 1) {
    await Membership.deleteMany({
      userId: user._id,
      _id: { $ne: membership._id },
    });
  }

  let business = membership ? await Business.findById(membership.businessId) : null;

  if (!business) {
    business = await Business.create({
      name: spec.businessName,
      tradeName: spec.businessName,
      ownerName: spec.name,
      email: spec.email,
      businessType: spec.businessType,
      industry: spec.businessType,
      subscriptionStatus: 'Active',
      subscriptionPlan: 'enterprise',
      subscriptionActivatedAt: new Date(),
      isActive: true,
      isDemoAccount: true,
      customFeatures: spec.customFeatures || [],
      enabledModules: resolveDefaultModules(spec.businessType),
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      themeColor: '#2F5D50',
      branding: { brandColor: '#2F5D50', primaryColor: '#2F5D50', invoiceTheme: 'modern' },
      onboardingCompleted: true,
      createdBy: user._id,
    });

    await Membership.create({
      userId: user._id,
      businessId: business._id,
      role: 'Owner',
      permissions: getPermissionsForRole('Owner'),
      status: 'active',
    });
  } else {
    business.name = spec.businessName;
    business.businessType = spec.businessType;
    business.subscriptionStatus = 'Active';
    business.isActive = true;
    business.isDemoAccount = true;
    business.subscriptionPlan = 'enterprise';
    business.customFeatures = spec.customFeatures || [];
    business.enabledModules = resolveDefaultModules(spec.businessType);
    business.onboardingCompleted = true;
    await business.save();
  }

  await Customer.deleteMany({ businessId: business._id });
  await Product.deleteMany({ businessId: business._id });
  await Invoice.deleteMany({ businessId: business._id });
  await Expense.deleteMany({ businessId: business._id });
  await seedDemoRecords(user, business);
  console.log(`→ Seeded sample records for ${spec.email}`);
}

async function seedDemoRecords(user, business) {
  const type = business.businessType || 'retail';

  let customerSpecs = [];
  let productSpecs = [];
  let invoiceSpecs = [];
  let expenseSpecs = [];

  if (type === 'salon') {
    customerSpecs = [
      { name: 'Ananya Sen', contactPerson: 'Ananya Sen', email: 'ananya@gmail.com', phone: '+91 98300 12345', city: 'Kolkata', state: 'West Bengal', outstandingBalance: 0, totalSpent: 25000, category: 'Loyalty Gold' },
      { name: 'Karan Malhotra', contactPerson: 'Karan Malhotra', email: 'karan@gmail.com', phone: '+91 98100 54321', city: 'Delhi', state: 'Delhi', outstandingBalance: 1200, totalSpent: 12000, category: 'Regular' },
      { name: 'Rohan Roy', contactPerson: 'Rohan Roy', email: 'rohan@gmail.com', phone: '+91 98400 98765', city: 'Chennai', state: 'Tamil Nadu', outstandingBalance: 0, totalSpent: 8500, category: 'Walk-in' },
    ];
    productSpecs = [
      { name: 'Hair Cut & Styling', type: 'service', sku: 'SAL-SRV-CUT', hsnSac: '999721', sellingPrice: 800, costPrice: 150, gstRate: 18, stock: 999, minStockLevel: 0, unit: 'session' },
      { name: 'Premium Hair Coloring', type: 'service', sku: 'SAL-SRV-COL', hsnSac: '999721', sellingPrice: 4500, costPrice: 800, gstRate: 18, stock: 999, minStockLevel: 0, unit: 'session' },
      { name: 'Hydrating Facial', type: 'service', sku: 'SAL-SRV-FAC', hsnSac: '999722', sellingPrice: 1500, costPrice: 300, gstRate: 18, stock: 999, minStockLevel: 0, unit: 'session' },
      { name: 'Moroccanoil Treatment Cream', type: 'product', sku: 'SAL-PRD-MOR', hsnSac: '330590', sellingPrice: 2800, costPrice: 1800, gstRate: 18, stock: 15, minStockLevel: 5, unit: 'unit' },
    ];
  } else if (type === 'restaurant') {
    customerSpecs = [
      { name: 'Vikram Seth', contactPerson: 'Vikram Seth', email: 'vikram@gmail.com', phone: '+91 99200 11223', city: 'Mumbai', state: 'Maharashtra', outstandingBalance: 0, totalSpent: 18000, category: 'VIP' },
      { name: 'Meera Nair', contactPerson: 'Meera Nair', email: 'meera@gmail.com', phone: '+91 99300 44556', city: 'Bengaluru', state: 'Karnataka', outstandingBalance: 450, totalSpent: 9200, category: 'Regular' },
    ];
    productSpecs = [
      { name: 'Paneer Tikka Platter', type: 'product', sku: 'RES-VEG-PT', hsnSac: '210690', sellingPrice: 320, costPrice: 110, gstRate: 5, stock: 500, minStockLevel: 10, unit: 'plate' },
      { name: 'Butter Chicken Special', type: 'product', sku: 'RES-NVG-BC', hsnSac: '210690', sellingPrice: 450, costPrice: 180, gstRate: 5, stock: 400, minStockLevel: 10, unit: 'plate' },
      { name: 'Garlic Naan', type: 'product', sku: 'RES-VEG-GN', hsnSac: '190590', sellingPrice: 80, costPrice: 20, gstRate: 5, stock: 1000, minStockLevel: 50, unit: 'piece' },
      { name: 'Espresso Single', type: 'product', sku: 'RES-BEV-ESP', hsnSac: '210111', sellingPrice: 120, costPrice: 30, gstRate: 5, stock: 800, minStockLevel: 20, unit: 'cup' },
    ];
  } else if (type === 'manufacturing') {
    customerSpecs = [
      { name: 'TATA Engineering', contactPerson: 'H. R. Tata', email: 'procurement@tataeng.com', phone: '+91 22 66658282', city: 'Pune', state: 'Maharashtra', outstandingBalance: 150000, totalSpent: 1200000, category: 'Corporate' },
      { name: 'Reliance Industries', contactPerson: 'A. Ambani', email: 'purchasing@ril.com', phone: '+91 22 22785000', city: 'Jamnagar', state: 'Gujarat', outstandingBalance: 0, totalSpent: 950000, category: 'Corporate' },
    ];
    productSpecs = [
      { name: 'Raw Material Steel Sheet (Grade A)', type: 'product', sku: 'MFG-RAW-STEEL', hsnSac: '720810', sellingPrice: 5000, costPrice: 3500, gstRate: 18, stock: 120, minStockLevel: 50, unit: 'ton' },
      { name: 'Finished Gear Assembly', type: 'product', sku: 'MFG-FIN-GEAR', hsnSac: '848340', sellingPrice: 25000, costPrice: 15000, gstRate: 18, stock: 15, minStockLevel: 5, unit: 'unit' },
      { name: 'Raw Material Copper Wire (2mm)', type: 'product', sku: 'MFG-RAW-COPPER', hsnSac: '740811', sellingPrice: 8500, costPrice: 6200, gstRate: 18, stock: 8, minStockLevel: 10, unit: 'roll' },
    ];
  } else if (type === 'stationery') {
    customerSpecs = [
      { name: 'Delhi Public School', contactPerson: 'S. K. Prasad', email: 'store@dps.edu.in', phone: '+91 11 26439871', city: 'Delhi', state: 'Delhi', outstandingBalance: 85000, totalSpent: 450000, category: 'School' },
      { name: 'Central Book House', contactPerson: 'R. K. Shah', email: 'centralbook@gmail.com', phone: '+91 79 26581122', city: 'Ahmedabad', state: 'Gujarat', outstandingBalance: 0, totalSpent: 180000, category: 'Wholesaler' },
    ];
    productSpecs = [
      { name: 'Deluxe A4 Ruled Notebook (Pack of 6)', type: 'product', sku: 'STA-NOTE-A4', hsnSac: '482010', sellingPrice: 360, costPrice: 210, gstRate: 12, stock: 80, minStockLevel: 200, unit: 'pack' },
      { name: 'Bulk School Supply Box', type: 'product', sku: 'STA-BOX-SCH', hsnSac: '482020', sellingPrice: 1500, costPrice: 950, gstRate: 12, stock: 50, minStockLevel: 10, unit: 'box' },
      { name: 'Wholesale Cartridge Paper (Ream)', type: 'product', sku: 'STA-PAP-CART', hsnSac: '480254', sellingPrice: 800, costPrice: 450, gstRate: 12, stock: 120, minStockLevel: 20, unit: 'ream' },
    ];
  } else {
    customerSpecs = [
      { name: 'Apex Global Solutions', contactPerson: 'Rahul Verma', email: 'rahul@apexglobal.com', phone: '+91 98111 22334', gstin: '27AAACA1234A1Z1', isIgst: true, outstandingBalance: 45000, totalSpent: 380000, category: 'Enterprise', city: 'Mumbai', state: 'Maharashtra' },
      { name: 'Zenith Digital Media', contactPerson: 'Priya Sharma', email: 'priya@zenithdigital.in', gstin: '29BBBCB5678B1Z2', isIgst: false, outstandingBalance: 0, totalSpent: 195000, category: 'Agency', city: 'Bengaluru', state: 'Karnataka' },
      { name: 'Nova Retail & Logistics', contactPerson: 'Vikram Malhotra', email: 'accounts@novaretail.co.in', gstin: '36CCCCD9012C1Z3', isIgst: true, outstandingBalance: 112000, totalSpent: 540000, category: 'Retailer', city: 'Hyderabad', state: 'Telangana' },
    ];
    productSpecs = [
      { name: 'SaaS Software Subscription (Annual)', type: 'service', sku: 'BIZ-SAAS-ANN', hsnSac: '998314', sellingPrice: 49999, costPrice: 12000, gstRate: 18, stock: 999, minStockLevel: 10, unit: 'license' },
      { name: 'AI Automation Consulting', type: 'service', sku: 'BIZ-CONS-AI', hsnSac: '998313', sellingPrice: 75000, costPrice: 25000, gstRate: 18, stock: 100, minStockLevel: 5, unit: 'project' },
      { name: 'POS Smart Terminal X1', type: 'product', sku: 'BIZ-HW-POS1', hsnSac: '847130', sellingPrice: 16500, costPrice: 11000, gstRate: 18, stock: 14, minStockLevel: 15, unit: 'unit' },
      { name: 'Thermal Receipt Roll (Box of 50)', type: 'product', sku: 'BIZ-ACC-ROLL50', hsnSac: '481190', sellingPrice: 1250, costPrice: 750, gstRate: 12, stock: 4, minStockLevel: 10, unit: 'box' },
    ];
  }

  const customers = await Customer.insertMany(customerSpecs.map(c => ({
    businessId: business._id,
    isIgst: c.isIgst ?? (c.state !== (business.address?.state || 'Karnataka')),
    status: 'active',
    ...c
  })));

  const products = await Product.insertMany(productSpecs.map(p => ({
    businessId: business._id,
    ...p
  })));

  if (type === 'salon') {
    invoiceSpecs = [
      {
        invoiceNumber: 'INV-SAL-001',
        customerId: customers[0]._id,
        customerName: customers[0].name,
        customerGstin: customers[0].gstin || '',
        issueDate: '2026-08-01',
        dueDate: '2026-08-01',
        items: [{ description: products[0].name, hsnSac: products[0].hsnSac, quantity: 1, rate: products[0].sellingPrice, gstRate: products[0].gstRate, amount: products[0].sellingPrice, taxAmount: products[0].sellingPrice * 0.18 }],
        subtotal: products[0].sellingPrice,
        taxableAmount: products[0].sellingPrice,
        cgst: products[0].sellingPrice * 0.09,
        sgst: products[0].sellingPrice * 0.09,
        totalTax: products[0].sellingPrice * 0.18,
        grandTotal: products[0].sellingPrice * 1.18,
        status: 'paid',
        paidAmount: products[0].sellingPrice * 1.18,
        paymentMethod: 'UPI / Card',
      },
      {
        invoiceNumber: 'INV-SAL-002',
        customerId: customers[1]._id,
        customerName: customers[1].name,
        customerGstin: customers[1].gstin || '',
        issueDate: '2026-08-05',
        dueDate: '2026-08-15',
        items: [{ description: products[1].name, hsnSac: products[1].hsnSac, quantity: 1, rate: products[1].sellingPrice, gstRate: products[1].gstRate, amount: products[1].sellingPrice, taxAmount: products[1].sellingPrice * 0.18 }],
        subtotal: products[1].sellingPrice,
        taxableAmount: products[1].sellingPrice,
        cgst: products[1].sellingPrice * 0.09,
        sgst: products[1].sellingPrice * 0.09,
        totalTax: products[1].sellingPrice * 0.18,
        grandTotal: products[1].sellingPrice * 1.18,
        status: 'pending',
        paidAmount: 0,
      }
    ];
    expenseSpecs = [
      { title: 'Stylist Commission & Staff Payroll', category: 'Salary', amount: 48000, date: '2026-08-01', paymentMode: 'Bank Transfer', vendor: 'Internal Staff', gstClaimable: false, status: 'paid' },
      { title: 'L\'Oreal & Matrix Hair Care Products', category: 'Inventory', amount: 15000, date: '2026-08-03', paymentMode: 'Corporate Card', vendor: 'L\'Oreal India', gstClaimable: true, gstAmount: 2288, status: 'paid' },
    ];
  } else if (type === 'restaurant') {
    invoiceSpecs = [
      {
        invoiceNumber: 'INV-RES-001',
        customerId: customers[0]._id,
        customerName: customers[0].name,
        customerGstin: customers[0].gstin || '',
        issueDate: '2026-08-08',
        dueDate: '2026-08-08',
        items: [
          { description: products[0].name, hsnSac: products[0].hsnSac, quantity: 2, rate: products[0].sellingPrice, gstRate: products[0].gstRate, amount: products[0].sellingPrice * 2, taxAmount: products[0].sellingPrice * 2 * 0.05 },
          { description: products[2].name, hsnSac: products[2].hsnSac, quantity: 3, rate: products[2].sellingPrice, gstRate: products[2].gstRate, amount: products[2].sellingPrice * 3, taxAmount: products[2].sellingPrice * 3 * 0.05 },
        ],
        subtotal: products[0].sellingPrice * 2 + products[2].sellingPrice * 3,
        taxableAmount: products[0].sellingPrice * 2 + products[2].sellingPrice * 3,
        cgst: (products[0].sellingPrice * 2 + products[2].sellingPrice * 3) * 0.025,
        sgst: (products[0].sellingPrice * 2 + products[2].sellingPrice * 3) * 0.025,
        totalTax: (products[0].sellingPrice * 2 + products[2].sellingPrice * 3) * 0.05,
        grandTotal: (products[0].sellingPrice * 2 + products[2].sellingPrice * 3) * 1.05,
        status: 'paid',
        paidAmount: (products[0].sellingPrice * 2 + products[2].sellingPrice * 3) * 1.05,
        paymentMethod: 'Razorpay / QR Code',
      }
    ];
    expenseSpecs = [
      { title: 'Fresh Dairy & Vegetable Supplies', category: 'Inventory', amount: 12500, date: '2026-08-07', paymentMode: 'Cash', vendor: 'Local Veg Market', gstClaimable: false, status: 'paid' },
      { title: 'Gas Cylinder Refills', category: 'Rent & Utilities', amount: 6200, date: '2026-08-04', paymentMode: 'UPI', vendor: 'Indane Gas', gstClaimable: true, gstAmount: 310, status: 'paid' },
    ];
  } else if (type === 'manufacturing') {
    invoiceSpecs = [
      {
        invoiceNumber: 'INV-MFG-001',
        customerId: customers[0]._id,
        customerName: customers[0].name,
        customerGstin: customers[0].gstin || '',
        issueDate: '2026-08-02',
        dueDate: '2026-09-02',
        items: [{ description: products[1].name, hsnSac: products[1].hsnSac, quantity: 5, rate: products[1].sellingPrice, gstRate: products[1].gstRate, amount: products[1].sellingPrice * 5, taxAmount: products[1].sellingPrice * 5 * 0.18 }],
        subtotal: products[1].sellingPrice * 5,
        taxableAmount: products[1].sellingPrice * 5,
        cgst: products[1].sellingPrice * 5 * 0.09,
        sgst: products[1].sellingPrice * 5 * 0.09,
        totalTax: products[1].sellingPrice * 5 * 0.18,
        grandTotal: products[1].sellingPrice * 5 * 1.18,
        status: 'pending',
        paidAmount: 0,
      }
    ];
    expenseSpecs = [
      { title: 'Machine Lubricants & Maintenance', category: 'Repairs', amount: 18000, date: '2026-08-02', paymentMode: 'Corporate Card', vendor: 'Lubricio Corp', gstClaimable: true, gstAmount: 2745, status: 'paid' },
      { title: 'Steel Sheet Metal Raw Supply', category: 'Inventory', amount: 120000, date: '2026-08-04', paymentMode: 'Bank Transfer', vendor: 'Jindal Steel', gstClaimable: true, gstAmount: 18305, status: 'paid' },
    ];
  } else if (type === 'stationery') {
    invoiceSpecs = [
      {
        invoiceNumber: 'INV-STA-001',
        customerId: customers[0]._id,
        customerName: customers[0].name,
        customerGstin: customers[0].gstin || '',
        issueDate: '2026-08-04',
        dueDate: '2026-08-24',
        items: [{ description: products[1].name, hsnSac: products[1].hsnSac, quantity: 40, rate: products[1].sellingPrice, gstRate: products[1].gstRate, amount: products[1].sellingPrice * 40, taxAmount: products[1].sellingPrice * 40 * 0.12 }],
        subtotal: products[1].sellingPrice * 40,
        taxableAmount: products[1].sellingPrice * 40,
        cgst: products[1].sellingPrice * 40 * 0.06,
        sgst: products[1].sellingPrice * 40 * 0.06,
        totalTax: products[1].sellingPrice * 40 * 0.12,
        grandTotal: products[1].sellingPrice * 40 * 1.12,
        status: 'pending',
        paidAmount: 0,
      }
    ];
    expenseSpecs = [
      { title: 'Bulk Paper Reams & Envelopes', category: 'Inventory', amount: 35000, date: '2026-08-03', paymentMode: 'Bank Transfer', vendor: 'Century Paper', gstClaimable: true, gstAmount: 3750, status: 'paid' },
    ];
  } else {
    invoiceSpecs = [
      {
        invoiceNumber: 'INV-2026-001',
        customerId: customers[0]._id,
        customerName: customers[0].name,
        customerGstin: customers[0].gstin || '',
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        items: [{ description: products[0].name, hsnSac: products[0].hsnSac, quantity: 2, rate: products[0].sellingPrice, gstRate: products[0].gstRate, amount: products[0].sellingPrice * 2, taxAmount: products[0].sellingPrice * 2 * 0.18 }],
        subtotal: products[0].sellingPrice * 2,
        discount: 5000,
        taxableAmount: products[0].sellingPrice * 2 - 5000,
        cgst: (products[0].sellingPrice * 2 - 5000) * 0.09,
        sgst: (products[0].sellingPrice * 2 - 5000) * 0.09,
        totalTax: (products[0].sellingPrice * 2 - 5000) * 0.18,
        grandTotal: (products[0].sellingPrice * 2 - 5000) * 1.18,
        status: 'paid',
        paidAmount: (products[0].sellingPrice * 2 - 5000) * 1.18,
        paymentMethod: 'Razorpay / UPI',
      }
    ];
    expenseSpecs = [
      { title: 'AWS & Cloud Server Hosting', category: 'Office & Tech', amount: 24500, date: '2026-07-05', paymentMode: 'Corporate Card', vendor: 'Amazon Web Services', gstClaimable: true, gstAmount: 3737, status: 'paid' },
    ];
  }

  await Invoice.insertMany(invoiceSpecs.map(i => ({
    businessId: business._id,
    ...i
  })));

  await Expense.insertMany(expenseSpecs.map(e => ({
    businessId: business._id,
    ...e
  })));

  await Notification.create({
    businessId: business._id,
    userId: user._id,
    title: 'Welcome to Biizora',
    message: `Your single-business workspace is ready with sample ${type} products, invoices, and metrics.`,
    type: 'system',
  });
}

