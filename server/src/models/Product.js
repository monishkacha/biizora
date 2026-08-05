import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['service', 'product'], default: 'product' },
    sku: { type: String, default: '' },
    hsnSac: { type: String, default: '' },
    category: { type: String, default: '' },
    sellingPrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    gstRate: { type: Number, default: 18 },
    stock: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 0 },
    unit: { type: String, default: 'unit' },
    description: { type: String, default: '' },
    brand: { type: String, default: '' },
    warehouse: { type: String, default: '' },
    barcode: { type: String, default: '' },
    images: { type: [String], default: [] },
    expiryDate: { type: Date },
    batchNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.index({ businessId: 1, name: 'text', sku: 'text', barcode: 'text' });

productSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    type: this.type,
    sku: this.sku,
    hsnSac: this.hsnSac,
    category: this.category,
    sellingPrice: this.sellingPrice,
    costPrice: this.costPrice,
    gstRate: this.gstRate,
    stock: this.stock,
    minStockLevel: this.minStockLevel,
    unit: this.unit,
    description: this.description,
    brand: this.brand,
    warehouse: this.warehouse,
    barcode: this.barcode,
    images: this.images,
    expiryDate: this.expiryDate,
    batchNumber: this.batchNumber,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Product = mongoose.model('Product', productSchema);
