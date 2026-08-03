import mongoose from 'mongoose';

/**
 * General support requests (email / ticket style) — extensible for SLA, CSAT, escalation.
 */
const supportRequestSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportAgent' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    channel: {
      type: String,
      enum: ['email', 'in_app', 'chat', 'phone', 'other'],
      default: 'email',
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    slaDueAt: Date,
    csatScore: Number,
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

supportRequestSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    businessId: this.businessId?.toString() || null,
    userId: this.userId?.toString() || null,
    assignedAgentId: this.assignedAgentId?.toString() || null,
    subject: this.subject,
    message: this.message,
    channel: this.channel,
    status: this.status,
    priority: this.priority,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);
