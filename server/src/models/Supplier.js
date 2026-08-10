import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
    products: { type: [String], default: [] },
    paymentTerms: { type: String, default: 'Net 30' },
    outstandingBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

supplierSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    phone: this.phone,
    email: this.email,
    address: this.address,
    gstin: this.gstin,
    products: this.products,
    paymentTerms: this.paymentTerms,
    outstandingBalance: this.outstandingBalance,
    createdAt: this.createdAt,
  };
};

export const Supplier = mongoose.model('Supplier', supplierSchema);
