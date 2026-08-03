import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { Membership } from '../models/Membership.js';
import { Invite } from '../models/Invite.js';
import { Notification } from '../models/Notification.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/tokens.js';
import { getPermissionsForRole } from '../services/permissionDefaults.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';

const REFRESH_COOKIE = 'biizora_refresh';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}

async function issueTokens(user, req, res) {
  const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  user.refreshTokens = (user.refreshTokens || []).filter((t) => t.expiresAt > new Date());
  user.refreshTokens.push({
    tokenHash,
    expiresAt,
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
  });
  await user.save();

  setRefreshCookie(res, refreshToken);
  return accessToken;
}

export const registerValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('companyName').optional().trim(),
];

export const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const register = [
  ...registerValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, name, companyName, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    const business = await Business.create({
      name: companyName || `${name}'s Business`,
      tradeName: companyName || name,
      email,
      phone: phone || '',
      createdBy: user._id,
      onboardingCompleted: false,
    });

    await Membership.create({
      userId: user._id,
      businessId: business._id,
      role: 'Owner',
      permissions: getPermissionsForRole('Owner'),
      status: 'active',
    });

    const accessToken = await issueTokens(user, req, res);

    await logActivity({
      businessId: business._id,
      userId: user._id,
      userName: user.name,
      action: 'user.registered',
      entityType: 'User',
      entityId: user._id,
      details: `Registered and created business ${business.name}`,
      ip: req.ip,
    });

    const memberships = await getUserMemberships(user._id);

    res.status(201).json({
      success: true,
      accessToken,
      user: user.toPublicJSON(),
      businesses: memberships,
      activeBusinessId: business._id.toString(),
    });
  }),
];

export const login = [
  ...loginValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = await issueTokens(user, req, res);
    const memberships = await getUserMemberships(user._id);

    await logActivity({
      userId: user._id,
      userName: user.name,
      action: 'user.login',
      entityType: 'User',
      entityId: user._id,
      details: 'User logged in',
      ip: req.ip,
      businessId: memberships[0]?.id,
    });

    res.json({
      success: true,
      accessToken,
      user: user.toPublicJSON(),
      businesses: memberships,
      activeBusinessId: memberships[0]?.id || null,
    });
  }),
];

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'User not found' });
  }

  const tokenHash = hashToken(token);
  const stored = user.refreshTokens.find((t) => t.tokenHash === tokenHash && t.expiresAt > new Date());
  if (!stored) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Refresh token revoked' });
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  await user.save();

  const accessToken = await issueTokens(user, req, res);
  const memberships = await getUserMemberships(user._id);

  res.json({
    success: true,
    accessToken,
    user: user.toPublicJSON(),
    businesses: memberships,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token && req.user) {
    const tokenHash = hashToken(token);
    req.user.refreshTokens = (req.user.refreshTokens || []).filter((t) => t.tokenHash !== tokenHash);
    await req.user.save();
  }
  clearRefreshCookie(res);
  if (req.user) {
    await logActivity({
      userId: req.user._id,
      userName: req.user.name,
      action: 'user.logout',
      entityType: 'User',
      entityId: req.user._id,
      details: 'User logged out',
      ip: req.ip,
    });
  }
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  const memberships = await getUserMemberships(req.userId);
  res.json({
    user: req.user.toPublicJSON(),
    businesses: memberships,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, preferences } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (avatar !== undefined) req.user.avatar = avatar;
  if (preferences) {
    req.user.preferences = { ...req.user.preferences.toObject?.() || req.user.preferences, ...preferences };
  }
  await req.user.save();

  await logActivity({
    userId: req.user._id,
    userName: req.user.name,
    action: 'settings.profile_updated',
    entityType: 'User',
    entityId: req.user._id,
    details: 'Profile updated',
    ip: req.ip,
  });

  res.json({ success: true, user: req.user.toPublicJSON() });
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const { token, name, password } = req.body;
  if (!token) return res.status(400).json({ error: 'Invite token required' });

  const tokenHash = hashToken(token);
  const invite = await Invite.findOne({ tokenHash, status: 'pending' });
  if (!invite || invite.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invite is invalid or expired' });
  }

  let user = await User.findOne({ email: invite.email });
  if (!user) {
    if (!password || !name) {
      return res.status(400).json({ error: 'Name and password required to accept invite' });
    }
    user = await User.create({
      name,
      email: invite.email,
      passwordHash: await bcrypt.hash(password, 12),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });
  }

  const existing = await Membership.findOne({ userId: user._id, businessId: invite.businessId });
  if (!existing) {
    await Membership.create({
      userId: user._id,
      businessId: invite.businessId,
      role: invite.role,
      permissions: getPermissionsForRole(invite.role),
      status: 'active',
    });
  }

  invite.status = 'accepted';
  await invite.save();

  await Notification.create({
    businessId: invite.businessId,
    userId: invite.invitedBy,
    title: 'Team invite accepted',
    message: `${user.name} joined as ${invite.role}`,
    type: 'team',
  });

  const accessToken = await issueTokens(user, req, res);
  const memberships = await getUserMemberships(user._id);

  res.json({
    success: true,
    accessToken,
    user: user.toPublicJSON(),
    businesses: memberships,
    activeBusinessId: invite.businessId.toString(),
  });
});

async function getUserMemberships(userId) {
  const memberships = await Membership.find({ userId, status: 'active' }).populate('businessId');
  return memberships
    .filter((m) => m.businessId)
    .map((m) => ({
      id: m.businessId._id.toString(),
      name: m.businessId.name,
      tradeName: m.businessId.tradeName,
      logoUrl: m.businessId.logoUrl,
      role: m.role,
      permissions: m.permissions,
      plan: 'Pro',
      onboardingCompleted: m.businessId.onboardingCompleted,
      membersCount: 0,
    }));
}
