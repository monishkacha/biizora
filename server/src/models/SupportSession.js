import mongoose from 'mongoose';

/**
 * Remote support / AnyDesk sessions — future-ready for video call & screen share.
 */
const supportSessionSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportAgent', index: true },
    channel: {
      type: String,
      enum: ['anydesk', 'email', 'chat', 'video', 'screen_share', 'other'],
      default: 'anydesk',
    },
    status: {
      type: String,
      enum: ['requested', 'scheduled', 'active', 'completed', 'cancelled'],
      default: 'requested',
    },
    scheduledAt: Date,
    startedAt: Date,
    endedAt: Date,
    notes: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

supportSessionSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    businessId: this.businessId?.toString() || null,
    userId: this.userId.toString(),
    agentId: this.agentId?.toString() || null,
    channel: this.channel,
    status: this.status,
    scheduledAt: this.scheduledAt,
    startedAt: this.startedAt,
    endedAt: this.endedAt,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const SupportSession = mongoose.model('SupportSession', supportSessionSchema);
