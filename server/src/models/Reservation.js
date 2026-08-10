import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm format, e.g. "19:30"
    guests: { type: Number, required: true, min: 1 },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    tableName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
      index: true,
    },
    specialRequests: { type: String, default: '' },
    bookingSource: {
      type: String,
      enum: ['Reservation', 'Walk-in', 'Online', 'Phone', 'QR'],
      default: 'Online',
    },
  },
  { timestamps: true }
);

reservationSchema.index({ businessId: 1, date: 1, time: 1 });

reservationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    customerName: this.customerName,
    phone: this.phone,
    email: this.email,
    date: this.date,
    time: this.time,
    guests: this.guests,
    tableId: this.tableId ? this.tableId.toString() : null,
    tableName: this.tableName,
    status: this.status,
    specialRequests: this.specialRequests,
    bookingSource: this.bookingSource,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Reservation = mongoose.model('Reservation', reservationSchema);
