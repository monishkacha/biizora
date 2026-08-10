import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true }, // e.g. "Chicken Raw", "Butter", "Tomato"
    sku: { type: String, default: '' },
    category: { type: String, default: 'General' }, // Meat, Dairy, Vegetables, Spices, Beverages, Packaging
    unit: { type: String, default: 'kg' }, // kg, g, l, ml, pcs, unit
    currentStock: { type: Number, required: true, default: 0 },
    minimumStock: { type: Number, default: 10 },
    costPerUnit: { type: Number, default: 0 },
    supplierName: { type: String, default: '' },
    status: { type: String, enum: ['ok', 'low_stock', 'out_of_stock'], default: 'ok' },
    expiryDate: { type: Date, default: null },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ businessId: 1, name: 'text' });

inventoryItemSchema.methods.toPublicJSON = function toPublicJSON() {
  const isLow = this.currentStock <= this.minimumStock && this.currentStock > 0;
  const isOut = this.currentStock <= 0;
  const computedStatus = isOut ? 'out_of_stock' : isLow ? 'low_stock' : 'ok';
  return {
    id: this._id.toString(),
    name: this.name,
    sku: this.sku,
    category: this.category,
    unit: this.unit,
    currentStock: this.currentStock,
    minimumStock: this.minimumStock,
    costPerUnit: this.costPerUnit,
    supplierName: this.supplierName,
    status: computedStatus,
    expiryDate: this.expiryDate,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
