import mongoose from 'mongoose';
import { ROLES } from '../services/permissionDefaults.js';
import { generateInviteToken, hashToken } from '../utils/tokens.js';

const inviteSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ROLES, default: 'Employee' },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'revoked', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

inviteSchema.statics.createInvite = async function createInvite({ businessId, email, role, invitedBy }) {
  const rawToken = generateInviteToken();
  const invite = await this.create({
    businessId,
    email,
    role,
    invitedBy,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { invite, rawToken };
};

export const Invite = mongoose.model('Invite', inviteSchema);
