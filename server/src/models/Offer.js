import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true }, // e.g. "WELCOME10", "OLIVE200"
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percentage', 'fixed', 'bogo', 'combo'], default: 'percentage' },
    value: { type: Number, required: true }, // e.g. 10 for 10% or 200 for ₹200
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 }, // 0 means uncapped
    isActive: { type: Boolean, default: true },
    validUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

offerSchema.index({ businessId: 1, code: 1 }, { unique: true });

offerSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    code: this.code,
    title: this.title,
    description: this.description,
    type: this.type,
    value: this.value,
    minOrderAmount: this.minOrderAmount,
    maxDiscount: this.maxDiscount,
    isActive: this.isActive,
    validUntil: this.validUntil,
    createdAt: this.createdAt,
  };
};

export const Offer = mongoose.model('Offer', offerSchema);
