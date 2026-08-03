import mongoose from 'mongoose';

const FEEDBACK_STATUSES = [
  'Submitted',
  'Under Review',
  'Accepted',
  'Planned',
  'In Development',
  'Resolved',
  'Rejected',
  'Closed',
];

const FEEDBACK_CATEGORIES = [
  'Bug Report',
  'Feature Request',
  'Improvement',
  'General Feedback',
];

const timelineEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['created', 'status_change', 'reply', 'assignment', 'note', 'closed', 'system'],
      required: true,
    },
    label: { type: String, required: true },
    detail: { type: String, default: '' },
    fromStatus: String,
    toStatus: String,
    actorType: { type: String, enum: ['user', 'admin', 'system'], default: 'system' },
    actorName: { type: String, default: 'Biizora' },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    feedbackId: { type: String, required: true, unique: true, index: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    subscriptionId: { type: String, default: null },

    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    category: { type: String, enum: FEEDBACK_CATEGORIES, required: true },
    message: { type: String, required: true, trim: true },

    priority: { type: Boolean, default: false, index: true },
    status: { type: String, enum: FEEDBACK_STATUSES, default: 'Submitted', index: true },
    currentStage: { type: String, default: 'Intake' },

    assignedTo: { type: String, default: 'Unassigned' },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportAgent' },

    resolutionSummary: { type: String, default: '' },
    resolvedAt: Date,
    closedAt: Date,
    /** When status becomes Resolved, auto-close after this timestamp if no user reply */
    autoCloseAt: Date,
    lastUserReplyAt: Date,
    lastAdminReplyAt: Date,

    source: {
      type: String,
      enum: ['landing', 'app', 'email', 'import', 'other'],
      default: 'landing',
    },

    timeline: [timelineEventSchema],

    /** Future notification channels */
    notifyChannels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

feedbackSchema.index({ businessId: 1, createdAt: -1 });
feedbackSchema.index({ email: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, autoCloseAt: 1 });

feedbackSchema.methods.toPublicJSON = function toPublicJSON(extras = {}) {
  return {
    id: this._id.toString(),
    feedbackId: this.feedbackId,
    businessId: this.businessId?.toString() || null,
    userId: this.userId?.toString() || null,
    name: this.name,
    email: this.email,
    subject: this.subject,
    category: this.category,
    message: this.message,
    priority: this.priority,
    status: this.status,
    currentStage: this.currentStage,
    assignedTo: this.assignedTo,
    assignedAgentId: this.assignedAgentId?.toString() || null,
    resolutionSummary: this.resolutionSummary,
    resolvedAt: this.resolvedAt,
    closedAt: this.closedAt,
    autoCloseAt: this.autoCloseAt,
    source: this.source,
    timeline: (this.timeline || []).map((t) => ({
      id: t._id.toString(),
      type: t.type,
      label: t.label,
      detail: t.detail,
      fromStatus: t.fromStatus,
      toStatus: t.toStatus,
      actorType: t.actorType,
      actorName: t.actorName,
      at: t.at,
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    ...extras,
  };
};

export { FEEDBACK_STATUSES, FEEDBACK_CATEGORIES };
export const Feedback = mongoose.model('Feedback', feedbackSchema);
