import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tradeName: { type: String, default: '' },
    industry: { type: String, default: '' },
    gstin: { type: String, default: '' },
    pan: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
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
    branding: {
      brandColor: { type: String, default: '#171717' },
      invoiceTheme: { type: String, default: 'modern' },
    },
    onboardingCompleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

businessSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    tradeName: this.tradeName,
    industry: this.industry,
    gstin: this.gstin,
    pan: this.pan,
    email: this.email,
    phone: this.phone,
    website: this.website,
    logoUrl: this.logoUrl,
    address: this.address?.line1 || '',
    city: this.address?.city || '',
    state: this.address?.state || '',
    pincode: this.address?.pincode || '',
    country: this.address?.country || 'India',
    bankDetails: this.bankDetails,
    currency: this.taxSettings?.currency || 'INR',
    currencySymbol: this.taxSettings?.currencySymbol || '₹',
    invoicePrefix: this.taxSettings?.invoicePrefix || 'INV-',
    defaultTaxRate: this.taxSettings?.defaultTaxRate ?? 18,
    invoiceTheme: this.branding?.invoiceTheme || this.taxSettings?.invoiceTheme || 'modern',
    branding: this.branding,
    taxSettings: this.taxSettings,
    onboardingCompleted: this.onboardingCompleted,
  };
};

export const Business = mongoose.model('Business', businessSchema);
