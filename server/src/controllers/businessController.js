import { Business } from '../models/Business.js';
import { Membership } from '../models/Membership.js';
import { getPermissionsForRole } from '../services/permissionDefaults.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listBusinesses = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({ userId: req.userId, status: 'active' }).populate('businessId');
  const result = await Promise.all(
    memberships
      .filter((m) => m.businessId)
      .map(async (m) => {
        const membersCount = await Membership.countDocuments({
          businessId: m.businessId._id,
          status: 'active',
        });
        return {
          ...m.businessId.toPublicJSON(),
          role: m.role,
          permissions: m.permissions,
          plan: 'Pro',
          membersCount,
        };
      })
  );
  res.json({ businesses: result });
});

export const createBusiness = asyncHandler(async (req, res) => {
  const { name, tradeName, industry } = req.body;
  if (!name) return res.status(400).json({ error: 'Business name is required' });

  const business = await Business.create({
    name,
    tradeName: tradeName || name,
    industry: industry || '',
    email: req.user.email,
    createdBy: req.userId,
    onboardingCompleted: false,
  });

  await Membership.create({
    userId: req.userId,
    businessId: business._id,
    role: 'Owner',
    permissions: getPermissionsForRole('Owner'),
    status: 'active',
  });

  await logActivity({
    businessId: business._id,
    userId: req.userId,
    userName: req.user.name,
    action: 'business.created',
    entityType: 'Business',
    entityId: business._id,
    details: `Created business ${business.name}`,
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    business: {
      ...business.toPublicJSON(),
      role: 'Owner',
      permissions: getPermissionsForRole('Owner'),
      plan: 'Pro',
      membersCount: 1,
    },
  });
});

export const getBusiness = asyncHandler(async (req, res) => {
  res.json({ business: req.business.toPublicJSON(), role: req.role, permissions: req.permissions });
});

export const updateBusiness = asyncHandler(async (req, res) => {
  const b = req.business;
  const fields = [
    'name', 'tradeName', 'industry', 'gstin', 'pan', 'email', 'phone', 'website', 'logoUrl', 'digitalSignatureUrl', 'stampUrl',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) b[f] = req.body[f];
  });

  // Flat address fields from legacy client shape
  if (req.body.address !== undefined || req.body.city || req.body.state || req.body.pincode) {
    b.address = {
      line1: req.body.address ?? b.address?.line1 ?? '',
      city: req.body.city ?? b.address?.city ?? '',
      state: req.body.state ?? b.address?.state ?? '',
      pincode: req.body.pincode ?? b.address?.pincode ?? '',
      country: req.body.country ?? b.address?.country ?? 'India',
    };
  }
  if (req.body.bankDetails) {
    b.bankDetails = { ...b.bankDetails.toObject?.() || b.bankDetails, ...req.body.bankDetails };
  }
  if (req.body.taxSettings) {
    b.taxSettings = { ...b.taxSettings.toObject?.() || b.taxSettings, ...req.body.taxSettings };
  }
  if (req.body.branding) {
    b.branding = { ...b.branding.toObject?.() || b.branding, ...req.body.branding };
  }
  if (req.body.currency !== undefined) b.taxSettings.currency = req.body.currency;
  if (req.body.currencySymbol !== undefined) b.taxSettings.currencySymbol = req.body.currencySymbol;
  if (req.body.invoicePrefix !== undefined) b.taxSettings.invoicePrefix = req.body.invoicePrefix;
  if (req.body.defaultTaxRate !== undefined) b.taxSettings.defaultTaxRate = req.body.defaultTaxRate;
  if (req.body.invoiceTheme !== undefined) {
    b.taxSettings.invoiceTheme = req.body.invoiceTheme;
    b.branding.invoiceTheme = req.body.invoiceTheme;
  }

  await b.save();

  await logActivity({
    businessId: b._id,
    userId: req.userId,
    userName: req.user.name,
    action: 'settings.business_updated',
    entityType: 'Business',
    entityId: b._id,
    details: 'Business settings updated',
    ip: req.ip,
  });

  res.json({ success: true, business: b.toPublicJSON() });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const b = req.business;
  const {
    name, industry, gstin, logoUrl, address, city, state, pincode, country,
    currency, defaultTaxRate, invoicePrefix, pan, phone, email, tradeName,
  } = req.body;

  if (name) b.name = name;
  if (tradeName) b.tradeName = tradeName;
  if (industry !== undefined) b.industry = industry;
  if (gstin !== undefined) b.gstin = gstin;
  if (pan !== undefined) b.pan = pan;
  if (logoUrl !== undefined) b.logoUrl = logoUrl;
  if (phone !== undefined) b.phone = phone;
  if (email !== undefined) b.email = email;

  b.address = {
    line1: address ?? b.address?.line1 ?? '',
    city: city ?? b.address?.city ?? '',
    state: state ?? b.address?.state ?? '',
    pincode: pincode ?? b.address?.pincode ?? '',
    country: country ?? b.address?.country ?? 'India',
  };

  if (currency) b.taxSettings.currency = currency;
  if (defaultTaxRate !== undefined) b.taxSettings.defaultTaxRate = defaultTaxRate;
  if (invoicePrefix) b.taxSettings.invoicePrefix = invoicePrefix;

  b.onboardingCompleted = true;
  await b.save();

  await logActivity({
    businessId: b._id,
    userId: req.userId,
    userName: req.user.name,
    action: 'business.onboarding_completed',
    entityType: 'Business',
    entityId: b._id,
    details: 'Onboarding completed',
    ip: req.ip,
  });

  res.json({ success: true, business: b.toPublicJSON() });
});
