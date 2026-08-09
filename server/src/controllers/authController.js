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
  body('companyName').trim().notEmpty().withMessage('Business name is required'),
  body('businessType')
    .trim()
    .notEmpty()
    .isIn(['salon', 'restaurant', 'cafe', 'retail', 'manufacturing', 'stationery'])
    .withMessage('Valid business type is required'),
];

export const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const ALLOWED_SIGNUP_TYPES = ['salon', 'restaurant', 'cafe', 'retail', 'manufacturing', 'stationery'];

export const register = [
  ...registerValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, name, companyName, phone, businessType } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    let type = String(businessType || '').toLowerCase();
    if (type === 'restaurant / cafe' || type === 'restaurant_cafe') type = 'restaurant';
    if (!ALLOWED_SIGNUP_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid business type' });
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
      name: companyName,
      tradeName: companyName,
      ownerName: name,
      email,
      phone: phone || '',
      businessType: type,
      industry: type,
      subscriptionStatus: 'Pending',
      subscriptionPlan: 'starter',
      isActive: false,
      createdBy: user._id,
      onboardingCompleted: true,
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
      details: `Registered ${business.name} (${type})`,
      ip: req.ip,
    });

    const businessPayload = await getPrimaryBusinessPayload(user._id);

    res.status(201).json({
      success: true,
      accessToken,
      user: user.toPublicJSON(),
      business: businessPayload,
      businesses: businessPayload ? [businessPayload] : [],
      activeBusinessId: businessPayload?.id || null,
      subscriptionPending: true,
      message:
        'Your account has been created successfully. Your subscription is currently pending activation.',
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
    const businessPayload = await getPrimaryBusinessPayload(user._id);

    await logActivity({
      userId: user._id,
      userName: user.name,
      action: 'user.login',
      entityType: 'User',
      entityId: user._id,
      details: 'User logged in',
      ip: req.ip,
      businessId: businessPayload?.id,
    });

    res.json({
      success: true,
      accessToken,
      user: user.toPublicJSON(),
      business: businessPayload,
      businesses: businessPayload ? [businessPayload] : [],
      activeBusinessId: businessPayload?.id || null,
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
  const businessPayload = await getPrimaryBusinessPayload(user._id);

  res.json({
    success: true,
    accessToken,
    user: user.toPublicJSON(),
    business: businessPayload,
    businesses: businessPayload ? [businessPayload] : [],
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
  const businessPayload = await getPrimaryBusinessPayload(req.userId);
  res.json({
    user: req.user.toPublicJSON(),
    business: businessPayload,
    businesses: businessPayload ? [businessPayload] : [],
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

  // One account → one business. Invited users who already own/belong to a business cannot join another.
  const existingMembership = await Membership.findOne({ userId: user._id, status: 'active' });
  if (existingMembership && String(existingMembership.businessId) !== String(invite.businessId)) {
    return res.status(409).json({
      error: 'This account already belongs to a business. One account can only access one business.',
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
  const businessPayload = await getPrimaryBusinessPayload(user._id);

  res.json({
    success: true,
    accessToken,
    user: user.toPublicJSON(),
    business: businessPayload,
    businesses: businessPayload ? [businessPayload] : [],
    activeBusinessId: invite.businessId.toString(),
  });
});

/** One account → one business. Prefer Owner membership if legacy duplicates exist. */
async function getPrimaryBusinessPayload(userId) {
  const memberships = await Membership.find({ userId, status: 'active' }).populate('businessId');
  const valid = memberships.filter((m) => m.businessId);
  if (!valid.length) return null;

  const primary =
    valid.find((m) => m.role === 'Owner') ||
    valid[0];

  const b = primary.businessId;
  const status = b.subscriptionStatus || 'Pending';
  return {
    id: b._id.toString(),
    name: b.name,
    businessName: b.name,
    tradeName: b.tradeName,
    ownerName: b.ownerName,
    logoUrl: b.logoUrl || b.logo || '',
    role: primary.role,
    permissions: primary.permissions,
    plan: b.subscriptionPlan || 'starter',
    subscriptionPlan: b.subscriptionPlan || 'starter',
    subscriptionStatus: status,
    subscriptionExpiresAt: b.subscriptionExpiresAt || null,
    subscriptionActivatedAt: b.subscriptionActivatedAt || null,
    businessType: b.businessType || 'general',
    enabledModules: b.enabledModules || [],
    customFeatures: b.customFeatures || [],
    isDemoAccount: Boolean(b.isDemoAccount),
    themeColor: b.themeColor || b.branding?.primaryColor || '#171717',
    isActive: status === 'Active' && b.isActive !== false,
    onboardingCompleted: b.onboardingCompleted !== false,
    membersCount: 0,
  };
}

// Kept for internal compatibility; always returns 0–1 business.
async function getUserMemberships(userId) {
  const primary = await getPrimaryBusinessPayload(userId);
  return primary ? [primary] : [];
}
