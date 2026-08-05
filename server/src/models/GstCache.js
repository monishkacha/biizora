import mongoose from 'mongoose';

const gstCacheSchema = new mongoose.Schema(
  {
    gstin: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    legalName: { type: String, default: '' },
    tradeName: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    constitution: { type: String, default: '' },
    registrationDate: { type: String, default: '' },
    address: { type: String, default: '' },
    buildingNumber: { type: String, default: '' },
    street: { type: String, default: '' },
    locality: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    pincode: { type: String, default: '' },
    rawResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const GstCache = mongoose.model('GstCache', gstCacheSchema);
