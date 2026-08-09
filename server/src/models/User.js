import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  userAgent: String,
  ip: String,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    emailVerified: { type: Boolean, default: true },
    isSuperAdmin: { type: Boolean, default: false, index: true },
    isDemoAccount: { type: Boolean, default: false, index: true },
    subscriptionPlan: { type: String, default: 'Pro Plan (14-Day Trial)' },
    subscriptionStatus: { type: String, enum: ['trial', 'active', 'cancelled', 'past_due'], default: 'trial' },
    trialDaysLeft: { type: Number, default: 14 },
    preferences: {
      theme: { type: String, default: 'light' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      language: { type: String, default: 'en' },
      bgStyle: { type: String, default: 'mono-light' },
    },
    refreshTokens: [refreshTokenSchema],
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isSuperAdmin =
    Boolean(this.isSuperAdmin) || adminEmails.includes(String(this.email || '').toLowerCase());

  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    avatar: this.avatar,
    emailVerified: this.emailVerified,
    isSuperAdmin,
    isDemoAccount: Boolean(this.isDemoAccount),
    subscriptionPlan: this.subscriptionPlan,
    subscriptionStatus: this.subscriptionStatus,
    trialDaysLeft: this.trialDaysLeft,
    preferences: this.preferences,
  };
};

export const User = mongoose.model('User', userSchema);
