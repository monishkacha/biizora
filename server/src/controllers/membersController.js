import { Membership } from '../models/Membership.js';
import { Invite } from '../models/Invite.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { ROLES, getPermissionsForRole } from '../services/permissionDefaults.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listMembers = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    businessId: req.businessId,
    status: { $in: ['active', 'invited'] },
  }).populate('userId', 'name email phone avatar');

  const members = memberships
    .filter((m) => m.userId)
    .map((m) => ({
      id: m._id.toString(),
      userId: m.userId._id.toString(),
      name: m.userId.name,
      email: m.userId.email,
      phone: m.userId.phone,
      avatar: m.userId.avatar,
      role: m.role,
      permissions: m.permissions,
      status: m.status,
    }));

  const pendingInvites = await Invite.find({
    businessId: req.businessId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });

  res.json({
    members,
    invites: pendingInvites.map((i) => ({
      id: i._id.toString(),
      email: i.email,
      role: i.role,
      status: i.status,
      expiresAt: i.expiresAt,
    })),
  });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (req.role !== 'Owner' && req.role !== 'Manager') {
    return res.status(403).json({ error: 'Only Owner or Manager can invite members' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const existingMembership = await Membership.findOne({
      userId: existingUser._id,
      businessId: req.businessId,
    });
    if (existingMembership?.status === 'active') {
      return res.status(409).json({ error: 'User is already a member' });
    }
  }

  const { invite, rawToken } = await Invite.createInvite({
    businessId: req.businessId,
    email: email.toLowerCase(),
    role: role || 'Employee',
    invitedBy: req.userId,
  });

  if (existingUser) {
    await Notification.create({
      businessId: req.businessId,
      userId: existingUser._id,
      title: 'Business invitation',
      message: `You were invited to join ${req.business.name} as ${invite.role}`,
      type: 'team',
      meta: { inviteToken: rawToken },
    });
  }

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'team.invited',
    entityType: 'Invite',
    entityId: invite._id,
    details: `Invited ${email} as ${invite.role}`,
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    invite: {
      id: invite._id.toString(),
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
      // Returned for demo / local accept flow (no email provider yet)
      token: rawToken,
    },
  });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  if (req.role !== 'Owner') {
    return res.status(403).json({ error: 'Only Owner can change roles' });
  }
  const { role } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (role !== 'Owner' && req.params.memberId) {
    // ensure at least one owner remains
  }

  const membership = await Membership.findOne({
    _id: req.params.memberId,
    businessId: req.businessId,
  }).populate('userId', 'name email');

  if (!membership) return res.status(404).json({ error: 'Member not found' });

  if (membership.role === 'Owner' && role !== 'Owner') {
    const ownerCount = await Membership.countDocuments({
      businessId: req.businessId,
      role: 'Owner',
      status: 'active',
    });
    if (ownerCount <= 1) {
      return res.status(400).json({ error: 'Cannot demote the only Owner' });
    }
  }

  membership.role = role;
  membership.permissions = getPermissionsForRole(role);
  await membership.save();

  if (membership.userId) {
    await Notification.create({
      businessId: req.businessId,
      userId: membership.userId._id,
      title: 'Role updated',
      message: `Your role was changed to ${role}`,
      type: 'team',
    });
  }

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'team.role_updated',
    entityType: 'Membership',
    entityId: membership._id,
    details: `Changed ${membership.userId?.email} role to ${role}`,
    ip: req.ip,
  });

  res.json({
    success: true,
    member: {
      id: membership._id.toString(),
      role: membership.role,
      permissions: membership.permissions,
    },
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  if (req.role !== 'Owner' && req.role !== 'Manager') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const membership = await Membership.findOne({
    _id: req.params.memberId,
    businessId: req.businessId,
  }).populate('userId', 'name email');

  if (!membership) return res.status(404).json({ error: 'Member not found' });
  if (membership.userId._id.equals(req.userId)) {
    return res.status(400).json({ error: 'Cannot remove yourself' });
  }
  if (membership.role === 'Owner' && req.role !== 'Owner') {
    return res.status(403).json({ error: 'Managers cannot remove Owners' });
  }

  membership.status = 'disabled';
  await membership.save();

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'team.member_removed',
    entityType: 'Membership',
    entityId: membership._id,
    details: `Removed ${membership.userId?.email}`,
    ip: req.ip,
  });

  res.json({ success: true });
});
