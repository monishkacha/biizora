import mongoose from 'mongoose';

const stationeryStockLogSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    changeQuantity: { type: Number, required: true },
    stockAfter: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['sale', 'purchase', 'adjustment', 'return', 'wastage', 'school_order', 'combo_sale'],
      required: true,
    },
    reason: { type: String, default: '' },
    reference: { type: String, default: '' },
    staffName: { type: String, default: 'System' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

stationeryStockLogSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    productId: this.productId.toString(),
    productName: this.productName,
    changeQuantity: this.changeQuantity,
    stockAfter: this.stockAfter,
    type: this.type,
    reason: this.reason,
    reference: this.reference,
    staffName: this.staffName,
    date: this.date,
    createdAt: this.createdAt,
  };
};

export const StationeryStockLog = mongoose.model('StationeryStockLog', stationeryStockLogSchema);
