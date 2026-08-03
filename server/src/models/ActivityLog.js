import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, default: '' },
    action: { type: String, required: true },
    entityType: { type: String, default: '' },
    entityId: { type: String, default: '' },
    details: { type: String, default: '' },
    ip: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    businessId: this.businessId?.toString() || null,
    userId: this.userId?.toString() || null,
    userName: this.userName,
    action: this.action,
    entityType: this.entityType,
    entityId: this.entityId,
    details: this.details,
    meta: this.meta,
    createdAt: this.createdAt,
  };
};

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
