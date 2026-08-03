import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    type: { type: String, enum: ['info', 'alert', 'warning', 'success', 'team', 'invoice', 'system', 'feedback', 'support'], default: 'info' },
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    businessId: this.businessId?.toString() || null,
    title: this.title,
    message: this.message,
    type: this.type,
    read: this.read,
    meta: this.meta,
    createdAt: this.createdAt,
  };
};

export const Notification = mongoose.model('Notification', notificationSchema);
