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
  console.log('  Industry: *-demo@biizora.com / demo123');
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

  const customerCount = await Customer.countDocuments({ businessId: business._id });
  if (customerCount === 0) {
    await seedDemoRecords(user, business);
    console.log('→ Seeded Adrian Hale sample invoices/customers');
  }
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

  const customerCount = await Customer.countDocuments({ businessId: business._id });
  if (customerCount === 0) {
    await seedDemoRecords(user, business);
    console.log(`→ Seeded sample records for ${spec.email}`);
  }
}

async function seedDemoRecords(user, business) {
  const customers = await Customer.insertMany([
    {
      businessId: business._id,
      name: 'Apex Global Solutions',
      contactPerson: 'Rahul Verma',
      email: 'rahul@apexglobal.com',
      phone: '+91 98111 22334',
      gstin: '27AAACA1234A1Z1',
      isIgst: true,
      outstandingBalance: 45000,
      totalSpent: 380000,
      status: 'active',
      category: 'Enterprise',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    {
      businessId: business._id,
      name: 'Zenith Digital Media',
      contactPerson: 'Priya Sharma',
      email: 'priya@zenithdigital.in',
      gstin: '29BBBCB5678B1Z2',
      isIgst: false,
      outstandingBalance: 0,
      totalSpent: 195000,
      status: 'active',
      category: 'Agency',
      city: 'Bengaluru',
      state: 'Karnataka',
    },
    {
      businessId: business._id,
      name: 'Nova Retail & Logistics',
      contactPerson: 'Vikram Malhotra',
      email: 'accounts@novaretail.co.in',
      gstin: '36CCCCD9012C1Z3',
      isIgst: true,
      outstandingBalance: 112000,
      totalSpent: 540000,
      status: 'active',
      category: 'Retailer',
      city: 'Hyderabad',
      state: 'Telangana',
    },
    {
      businessId: business._id,
      name: 'Kaveri Engineering Works',
      contactPerson: 'Srinivas Rao',
      email: 'srinivas@kaverieng.com',
      gstin: '33DDDDE3456D1Z4',
      isIgst: true,
      outstandingBalance: 18500,
      totalSpent: 92000,
      status: 'active',
      category: 'Manufacturer',
      city: 'Chennai',
      state: 'Tamil Nadu',
    },
  ]);

  const products = await Product.insertMany([
    {
      businessId: business._id,
      name: 'SaaS Software Subscription (Annual)',
      type: 'service',
      sku: 'BIZ-SAAS-ANN',
      hsnSac: '998314',
      sellingPrice: 49999,
      costPrice: 12000,
      gstRate: 18,
      stock: 999,
      minStockLevel: 10,
      unit: 'license',
    },
    {
      businessId: business._id,
      name: 'AI Automation Consulting',
      type: 'service',
      sku: 'BIZ-CONS-AI',
      hsnSac: '998313',
      sellingPrice: 75000,
      costPrice: 25000,
      gstRate: 18,
      stock: 100,
      minStockLevel: 5,
      unit: 'project',
    },
    {
      businessId: business._id,
      name: 'POS Smart Terminal X1',
      type: 'product',
      sku: 'BIZ-HW-POS1',
      hsnSac: '847130',
      sellingPrice: 16500,
      costPrice: 11000,
      gstRate: 18,
      stock: 14,
      minStockLevel: 15,
      unit: 'unit',
    },
    {
      businessId: business._id,
      name: 'Thermal Receipt Roll (Box of 50)',
      type: 'product',
      sku: 'BIZ-ACC-ROLL50',
      hsnSac: '481190',
      sellingPrice: 1250,
      costPrice: 750,
      gstRate: 12,
      stock: 4,
      minStockLevel: 10,
      unit: 'box',
    },
  ]);

  await Invoice.insertMany([
    {
      businessId: business._id,
      invoiceNumber: 'INV-2026-001',
      customerId: customers[0]._id,
      customerName: customers[0].name,
      customerGstin: customers[0].gstin,
      issueDate: '2026-07-15',
      dueDate: '2026-08-14',
      items: [{ description: products[0].name, hsnSac: '998314', quantity: 2, rate: 49999, gstRate: 18, amount: 99998, taxAmount: 17999.64 }],
      subtotal: 99998,
      discount: 5000,
      taxableAmount: 94998,
      igst: 17099.64,
      totalTax: 17099.64,
      grandTotal: 112097.64,
      status: 'paid',
      paidAmount: 112097.64,
      paymentMethod: 'Razorpay / UPI',
    },
    {
      businessId: business._id,
      invoiceNumber: 'INV-2026-002',
      customerId: customers[1]._id,
      customerName: customers[1].name,
      customerGstin: customers[1].gstin,
      issueDate: '2026-07-20',
      dueDate: '2026-08-04',
      items: [{ description: products[1].name, hsnSac: '998313', quantity: 1, rate: 75000, gstRate: 18, amount: 75000, taxAmount: 13500 }],
      subtotal: 75000,
      taxableAmount: 75000,
      cgst: 6750,
      sgst: 6750,
      totalTax: 13500,
      grandTotal: 88500,
      status: 'paid',
      paidAmount: 88500,
      paymentMethod: 'Bank Transfer (NEFT)',
    },
    {
      businessId: business._id,
      invoiceNumber: 'INV-2026-003',
      customerId: customers[2]._id,
      customerName: customers[2].name,
      customerGstin: customers[2].gstin,
      issueDate: '2026-07-01',
      dueDate: '2026-07-16',
      items: [{ description: products[2].name, hsnSac: '847130', quantity: 5, rate: 16500, gstRate: 18, amount: 82500, taxAmount: 14850 }],
      subtotal: 82500,
      discount: 2500,
      taxableAmount: 80000,
      igst: 14400,
      totalTax: 14400,
      shippingCharge: 500,
      grandTotal: 94900,
      status: 'overdue',
      paidAmount: 0,
    },
    {
      businessId: business._id,
      invoiceNumber: 'INV-2026-004',
      customerId: customers[3]._id,
      customerName: customers[3].name,
      customerGstin: customers[3].gstin,
      issueDate: '2026-07-28',
      dueDate: '2026-08-12',
      items: [{ description: products[3].name, hsnSac: '481190', quantity: 10, rate: 1250, gstRate: 12, amount: 12500, taxAmount: 1500 }],
      subtotal: 12500,
      taxableAmount: 12500,
      igst: 1500,
      totalTax: 1500,
      shippingCharge: 350,
      grandTotal: 14350,
      status: 'pending',
      paidAmount: 0,
    },
  ]);

  await Expense.insertMany([
    { businessId: business._id, title: 'AWS & Cloud Server Hosting', category: 'Office & Tech', amount: 24500, date: '2026-07-05', paymentMode: 'Corporate Card', vendor: 'Amazon Web Services', gstClaimable: true, gstAmount: 3737, status: 'paid' },
    { businessId: business._id, title: 'Koramangala Office Rent', category: 'Rent', amount: 65000, date: '2026-07-01', paymentMode: 'Bank Transfer', vendor: 'Innovate Park Developers', gstClaimable: true, gstAmount: 9915, status: 'paid' },
    { businessId: business._id, title: 'Google Workspace & Software Tools', category: 'Office & Tech', amount: 12800, date: '2026-07-10', paymentMode: 'Corporate Card', vendor: 'Google India', gstClaimable: true, gstAmount: 1952, status: 'paid' },
    { businessId: business._id, title: 'Team Performance Bonus & Stipends', category: 'Salary', amount: 145000, date: '2026-07-31', paymentMode: 'Bank Transfer', vendor: 'Internal Payroll', gstClaimable: false, gstAmount: 0, status: 'paid' },
    { businessId: business._id, title: 'Digital Marketing & LinkedIn Ads', category: 'Marketing', amount: 32000, date: '2026-07-22', paymentMode: 'Corporate Card', vendor: 'LinkedIn Ireland', gstClaimable: true, gstAmount: 4881, status: 'paid' },
  ]);

  await Notification.create({
    businessId: business._id,
    userId: user._id,
    title: 'Welcome to Biizora',
    message: 'Your single-business workspace is ready with sample invoices, customers, and dashboard metrics.',
    type: 'system',
  });
}
