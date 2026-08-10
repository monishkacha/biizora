import mongoose from 'mongoose';

const comboItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const productComboSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: '' },
    sellingPrice: { type: Number, default: 0 },
    gstRate: { type: Number, default: 12 },
    items: [comboItemSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productComboSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    sku: this.sku,
    sellingPrice: this.sellingPrice,
    gstRate: this.gstRate,
    items: this.items.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
    })),
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ProductCombo = mongoose.model('ProductCombo', productComboSchema);
