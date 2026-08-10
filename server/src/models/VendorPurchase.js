import mongoose from 'mongoose';

const vendorPurchaseSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    vendorName: { type: String, default: '' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['paid', 'partial', 'pending'], default: 'pending' },
    purchaseDate: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

vendorPurchaseSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    vendorId: this.vendorId.toString(),
    vendorName: this.vendorName,
    productId: this.productId?.toString() || null,
    productName: this.productName,
    quantity: this.quantity,
    unitCost: this.unitCost,
    totalAmount: this.totalAmount,
    paidAmount: this.paidAmount,
    paymentStatus: this.paymentStatus,
    purchaseDate: this.purchaseDate,
    notes: this.notes,
    createdAt: this.createdAt,
  };
};

export const VendorPurchase = mongoose.model('VendorPurchase', vendorPurchaseSchema);
