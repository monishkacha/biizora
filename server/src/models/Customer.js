import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    gstin: { type: String, default: '' },
    pan: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    isIgst: { type: Boolean, default: false },
    outstandingBalance: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    category: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

customerSchema.index({ businessId: 1, name: 'text', email: 'text', gstin: 'text' });

customerSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    contactPerson: this.contactPerson,
    email: this.email,
    phone: this.phone,
    gstin: this.gstin,
    pan: this.pan,
    address: this.address,
    city: this.city,
    state: this.state,
    pincode: this.pincode,
    isIgst: this.isIgst,
    outstandingBalance: this.outstandingBalance,
    totalSpent: this.totalSpent,
    status: this.status,
    category: this.category,
    notes: this.notes,
  };
};

export const Customer = mongoose.model('Customer', customerSchema);
