import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUSES, PLAN_IDS } from '../config/plans.js';
import { resolveDefaultModules, normalizeBusinessType } from '../config/businessTypes.js';

const workingHoursSchema = new mongoose.Schema(
  {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: true } },
  },
  { _id: false }
);

const businessSchema = new mongoose.Schema(
  {
    // Core identity (name kept for backward compatibility = businessName)
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },
    tradeName: { type: String, default: '' },
    ownerName: { type: String, default: '' },
    industry: { type: String, default: '' },
    publicSettings: {
      onlineBookingEnabled: { type: Boolean, default: true },
      onlineOrderingEnabled: { type: Boolean, default: true },
      onlinePaymentsEnabled: { type: Boolean, default: true },
      qrScansCount: { type: Number, default: 42 },
      pageViewsCount: { type: Number, default: 128 },
    },
    businessType: {
      type: String,
      default: 'general',
      index: true,
    },
    gstin: { type: String, default: '' },
    GSTNumber: { type: String, default: '' },
    pan: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    logo: { type: String, default: '' },
    digitalSignatureUrl: { type: String, default: '' },
    stampUrl: { type: String, default: '' },

    // Subscription / SaaS
    subscriptionStatus: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: 'Pending',
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: PLAN_IDS,
      default: 'starter',
      index: true,
    },
    subscriptionActivatedAt: { type: Date, default: null },
    subscriptionExpiresAt: { type: Date, default: null },
    subscriptionNotes: { type: String, default: '' },

    // Module & feature flags (configuration-driven)
    enabledModules: { type: [String], default: [] },
    customFeatures: { type: [String], default: [] },

    // White-label / branding
    themeColor: { type: String, default: '#171717' },
    branding: {
      brandColor: { type: String, default: '#171717' },
      primaryColor: { type: String, default: '#171717' },
      invoiceTheme: { type: String, default: 'modern' },
      invoiceLogo: { type: String, default: '' },
      language: { type: String, default: 'en' },
    },

    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    workingHours: { type: workingHoursSchema, default: () => ({}) },

    invoicePrefix: { type: String, default: 'INV-' },

    address: {
      line1: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      branch: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    taxSettings: {
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      defaultTaxRate: { type: Number, default: 18 },
      invoicePrefix: { type: String, default: 'INV-' },
      invoiceTheme: { type: String, default: 'modern' },
    },

    isActive: { type: Boolean, default: true, index: true },
    isDemoAccount: { type: Boolean, default: false, index: true },
    onboardingCompleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

businessSchema.index({ subscriptionStatus: 1, businessType: 1 });
businessSchema.index({ email: 1 });

businessSchema.virtual('businessName').get(function getBusinessName() {
  return this.name;
});

businessSchema.pre('save', function normalizeBizFields(next) {
  if (this.isModified('name') || this.isNew || !this.slug) {
    if (!this.tradeName) this.tradeName = this.name;
    if (!this.slug && this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
  }
  if (this.GSTNumber && !this.gstin) this.gstin = this.GSTNumber;
  if (this.gstin && !this.GSTNumber) this.GSTNumber = this.gstin;
  if (this.logo && !this.logoUrl) this.logoUrl = this.logo;
  if (this.logoUrl && !this.logo) this.logo = this.logoUrl;
  if (this.themeColor) {
    this.branding = this.branding || {};
    if (!this.branding.brandColor || this.isModified('themeColor')) {
      this.branding.brandColor = this.themeColor;
      this.branding.primaryColor = this.themeColor;
    }
  }
  if (this.invoicePrefix) {
    this.taxSettings = this.taxSettings || {};
    this.taxSettings.invoicePrefix = this.invoicePrefix;
  }
  if (this.currency) {
    this.taxSettings = this.taxSettings || {};
    this.taxSettings.currency = this.currency;
  }
  if (this.businessType) {
    this.businessType = normalizeBusinessType(this.businessType);
  } else if (this.industry) {
    this.businessType = normalizeBusinessType(this.industry);
  }
  if (!this.enabledModules || this.enabledModules.length === 0) {
    this.enabledModules = resolveDefaultModules(this.businessType || 'general');
  }
  // Mirror isActive from subscription for convenience
  if (this.isModified('subscriptionStatus')) {
    this.isActive = this.subscriptionStatus === 'Active';
  }
  next();
});

businessSchema.methods.toPublicJSON = function toPublicJSON() {
  const logo = this.logo || this.logoUrl || '';
  const generatedSlug = this.slug || (this.name ? this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'business');
  return {
    id: this._id.toString(),
    businessName: this.name,
    name: this.name,
    slug: generatedSlug,
    tradeName: this.tradeName,
    ownerName: this.ownerName,
    publicSettings: this.publicSettings || {
      onlineBookingEnabled: true,
      onlineOrderingEnabled: true,
      onlinePaymentsEnabled: true,
      qrScansCount: 42,
      pageViewsCount: 128,
    },
    industry: this.industry,
    businessType: this.businessType || normalizeBusinessType(this.industry),
    gstin: this.gstin || this.GSTNumber || '',
    GSTNumber: this.GSTNumber || this.gstin || '',
    pan: this.pan,
    email: this.email,
    phone: this.phone,
    website: this.website,
    logoUrl: logo,
    logo,
    digitalSignatureUrl: this.digitalSignatureUrl,
    stampUrl: this.stampUrl,
    address: this.address?.line1 || '',
    city: this.address?.city || '',
    state: this.address?.state || '',
    pincode: this.address?.pincode || '',
    country: this.address?.country || 'India',
    addressFull: this.address,
    bankDetails: this.bankDetails,
    currency: this.currency || this.taxSettings?.currency || 'INR',
    currencySymbol: this.taxSettings?.currencySymbol || '₹',
    timezone: this.timezone || 'Asia/Kolkata',
    workingHours: this.workingHours,
    invoicePrefix: this.invoicePrefix || this.taxSettings?.invoicePrefix || 'INV-',
    defaultTaxRate: this.taxSettings?.defaultTaxRate ?? 18,
    invoiceTheme: this.branding?.invoiceTheme || this.taxSettings?.invoiceTheme || 'modern',
    themeColor: this.themeColor || this.branding?.primaryColor || this.branding?.brandColor || '#171717',
    branding: this.branding,
    taxSettings: this.taxSettings,
    subscriptionStatus: this.subscriptionStatus || 'Pending',
    subscriptionPlan: this.subscriptionPlan || 'starter',
    subscriptionActivatedAt: this.subscriptionActivatedAt,
    subscriptionExpiresAt: this.subscriptionExpiresAt,
    enabledModules: this.enabledModules || [],
    customFeatures: this.customFeatures || [],
    isDemoAccount: Boolean(this.isDemoAccount),
    isActive: this.subscriptionStatus === 'Active' && this.isActive !== false,
    onboardingCompleted: this.onboardingCompleted,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Business = mongoose.model('Business', businessSchema);
