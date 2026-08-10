import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    tableNumber: { type: Number, required: true },
    name: { type: String, required: true }, // e.g. "Table 1", "T-01"
    capacity: { type: Number, required: true, default: 4 },
    section: { type: String, default: 'Indoor' }, // Indoor, Outdoor, Private Dining, Bar
    shape: { type: String, enum: ['square', 'round', 'rectangle'], default: 'square' },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied', 'order_ready', 'payment_pending', 'cleaning'],
      default: 'available',
      index: true,
    },
    currentGuests: { type: Number, default: 0 },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    serverName: { type: String, default: '' },
    timeSeated: { type: Date, default: null },
  },
  { timestamps: true }
);

tableSchema.index({ businessId: 1, tableNumber: 1 }, { unique: true });

tableSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    tableNumber: this.tableNumber,
    name: this.name,
    capacity: this.capacity,
    section: this.section,
    shape: this.shape,
    status: this.status,
    currentGuests: this.currentGuests,
    currentOrderId: this.currentOrderId ? this.currentOrderId.toString() : null,
    serverName: this.serverName,
    timeSeated: this.timeSeated,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Table = mongoose.model('Table', tableSchema);
