import mongoose from 'mongoose';
import { ROLES, getPermissionsForRole } from '../services/permissionDefaults.js';

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    role: { type: String, enum: ROLES, required: true, default: 'Employee' },
    permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['active', 'invited', 'disabled'], default: 'active' },
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });

membershipSchema.pre('save', function setDefaultPermissions(next) {
  if (!this.permissions || Object.keys(this.permissions).length === 0) {
    this.permissions = getPermissionsForRole(this.role);
  }
  next();
});

export const Membership = mongoose.model('Membership', membershipSchema);
