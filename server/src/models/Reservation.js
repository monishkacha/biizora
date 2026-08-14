import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    bookingId: { type: String, default: '' },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // e.g. "10:00 AM" or "10:00"
    guests: { type: Number, default: 1, min: 1 },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    tableName: { type: String, default: '' },

    // Salon specific fields
    serviceName: { type: String, default: 'Salon Service' },
    stylistName: { type: String, default: 'Any Available Stylist' },
    durationMin: { type: Number, default: 45 },
    totalAmount: { type: Number, default: 0 },
    bookingFee: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'unpaid', 'refunded'], default: 'paid' },
    paymentMethod: { type: String, default: 'Razorpay / Demo Payment' },
    suggestedTime: { type: String, default: '' },
    adminNotes: { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'alternative_suggested', 'seated', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
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
reservationSchema.index({ businessId: 1, stylistName: 1, date: 1, time: 1 });

reservationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    bookingId: this.bookingId || `SAL-${this._id.toString().slice(-4).toUpperCase()}`,
    customerName: this.customerName,
    phone: this.phone,
    email: this.email,
    date: this.date,
    time: this.time,
    serviceName: this.serviceName,
    stylistName: this.stylistName,
    durationMin: this.durationMin,
    totalAmount: this.totalAmount,
    bookingFee: this.bookingFee,
    remainingAmount: this.remainingAmount,
    paymentStatus: this.paymentStatus,
    paymentMethod: this.paymentMethod,
    suggestedTime: this.suggestedTime,
    adminNotes: this.adminNotes,
    status: this.status,
    specialRequests: this.specialRequests,
    bookingSource: this.bookingSource,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Reservation = mongoose.model('Reservation', reservationSchema);
