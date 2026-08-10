import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    ingredientName: { type: String, required: true },
    changeQuantity: { type: Number, required: true }, // positive for purchase/add, negative for deduction/waste
    type: {
      type: String,
      enum: ['purchase', 'consumption', 'adjustment', 'waste', 'return'],
      required: true,
    },
    reason: { type: String, default: '' }, // Spoilage, Overproduction, Damaged, Returned, Order Recipe Deduction
    staffName: { type: String, default: 'System' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

stockMovementSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    inventoryItemId: this.inventoryItemId.toString(),
    ingredientName: this.ingredientName,
    changeQuantity: this.changeQuantity,
    type: this.type,
    reason: this.reason,
    staffName: this.staffName,
    date: this.date,
    createdAt: this.createdAt,
  };
};

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
