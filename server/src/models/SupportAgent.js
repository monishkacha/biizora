import mongoose from 'mongoose';

/**
 * Support agents / founders available for remote assistance.
 * Configurable via env on boot; also editable later for scheduling, live chat, etc.
 */
const supportAgentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    avatar: { type: String, default: '' },
    anydeskId: { type: String, default: '' },
    anydeskLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['online', 'offline', 'busy', 'away'],
      default: 'offline',
    },
    sortOrder: { type: Number, default: 0 },
    isFounder: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    /** Future: availability calendar, timezone, SLA tier */
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

supportAgentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    role: this.role,
    email: this.email,
    avatar: this.avatar,
    anydeskId: this.anydeskId,
    anydeskLink: this.anydeskLink,
    status: this.status,
    isFounder: this.isFounder,
    sortOrder: this.sortOrder,
  };
};

export const SupportAgent = mongoose.model('SupportAgent', supportAgentSchema);
