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

export const DEMO_EMAIL = 'adrian.hale@biizora.demo';
export const DEMO_PASSWORD = 'demo1234';

/**
 * Always ensure the Adrian Hale demo account exists with a known password
 * and a fully populated sample business — even if other users already exist.
 * Safe to call on every server start.
 */
export async function ensureDemoSeed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // Migrate legacy demo identity if present
  const legacy = await User.findOne({ email: 'kpatel3360@gmail.com' });
  const existingDemo = await User.findOne({ email: DEMO_EMAIL });
  if (legacy && !existingDemo) {
    legacy.name = 'Adrian Hale';
    legacy.email = DEMO_EMAIL;
    legacy.passwordHash = passwordHash;
    legacy.phone = '+91 98765 43210';
    legacy.avatar = 'https://api.dicebear.com/7.x/initials/svg?seed=Adrian%20Hale';
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
      subscriptionPlan: 'Pro Plan',
      subscriptionStatus: 'active',
      trialDaysLeft: 14,
      preferences: { theme: 'light', timezone: 'Asia/Kolkata', language: 'en', bgStyle: 'ivory-cream' },
    });
    console.log('→ Created demo user Adrian Hale');
  } else {
    user.name = 'Adrian Hale';
    user.passwordHash = passwordHash;
    user.phone = '+91 98765 43210';
    user.avatar = 'https://api.dicebear.com/7.x/initials/svg?seed=Adrian%20Hale';
    user.subscriptionPlan = user.subscriptionPlan || 'Pro Plan';
    user.subscriptionStatus = user.subscriptionStatus || 'active';
    user.preferences = {
      theme: 'light',
      timezone: user.preferences?.timezone || 'Asia/Kolkata',
      language: user.preferences?.language || 'en',
      bgStyle: user.preferences?.bgStyle || 'ivory-cream',
    };
    await user.save();
  }

  let membership = await Membership.findOne({ userId: user._id, status: 'active' });
  let business = membership ? await Business.findById(membership.businessId) : null;

  if (!business) {
    business = await createDemoBusinesses(user);
    membership = await Membership.findOne({ userId: user._id, businessId: business._id });
  }

  const customerCount = await Customer.countDocuments({ businessId: business._id });
  if (customerCount === 0) {
    await seedDemoRecords(user, business);
    console.log('→ Seeded demo business analytics data');
  }

  console.log(`✓ Demo ready (${DEMO_EMAIL} / ${DEMO_PASSWORD})`);
  return true;
}

async function createDemoBusinesses(user) {
  const business = await Business.create({
    name: 'Hale Analytics Group',
    tradeName: 'Hale Analytics',
    industry: 'Software & SaaS',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    email: DEMO_EMAIL,
    phone: '+91 98765 43210',
    website: 'https://biizora.in',
    address: {
      line1: 'Suite 402, Innovate Tech Park, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      country: 'India',
    },
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountName: 'Hale Analytics Group',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0001234',
      branch: 'Koramangala 4th Block',
      upiId: 'hale@hdfcbank',
    },
    taxSettings: {
      currency: 'INR',
      currencySymbol: '₹',
      defaultTaxRate: 18,
      invoicePrefix: 'INV-2026-',
      invoiceTheme: 'modern',
    },
    branding: { brandColor: '#2F5D50', invoiceTheme: 'modern' },
    onboardingCompleted: true,
    createdBy: user._id,
  });

  const retail = await Business.create({
    name: 'Apex Retail Outlet',
    tradeName: 'Apex Retail',
    industry: 'Retail',
    email: DEMO_EMAIL,
    createdBy: user._id,
    onboardingCompleted: true,
    taxSettings: {
      currency: 'INR',
      currencySymbol: '₹',
      defaultTaxRate: 18,
      invoicePrefix: 'AR-',
      invoiceTheme: 'modern',
    },
  });

  await Membership.insertMany([
    {
      userId: user._id,
      businessId: business._id,
      role: 'Owner',
      permissions: getPermissionsForRole('Owner'),
      status: 'active',
    },
    {
      userId: user._id,
      businessId: retail._id,
      role: 'Owner',
      permissions: getPermissionsForRole('Owner'),
      status: 'active',
    },
  ]);

  return business;
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
    message: 'Explore Hale Analytics Group — a sample workspace with invoices, customers, expenses, and live dashboard metrics.',
    type: 'system',
  });
}
