import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    eventType: {
      type: String,
      enum: ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'EMAIL_VERIFIED', 'PASSWORD_CHANGED', 'PASSWORD_RESET'],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    device: {
      type: String,
      default: 'Desktop',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    operatingSystem: {
      type: String,
      default: 'Unknown',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

securityEventSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    businessId: this.businessId?.toString() || null,
    userId: this.userId?.toString() || null,
    userEmail: this.userEmail,
    eventType: this.eventType,
    timestamp: this.timestamp || this.createdAt,
    ipAddress: this.ipAddress,
    device: this.device,
    browser: this.browser,
    operatingSystem: this.operatingSystem,
    metadata: this.metadata,
  };
};

export const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);
