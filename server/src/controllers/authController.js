import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { Membership } from '../models/Membership.js';
import { Invite } from '../models/Invite.js';
import { Notification } from '../models/Notification.js';
import { OTP } from '../models/OTP.js';
import { SecurityEvent } from '../models/SecurityEvent.js';
import {
  sendVerificationOTP,
  sendLoginAlert,
  sendLogoutAlert,
  sendSecurityAlert,
  sendWelcomeEmail,
} from '../services/emailService.js';
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
import { parseDeviceDetails } from '../utils/deviceParser.js';

const REFRESH_COOKIE = 'biizora_refresh';
const ALLOWED_SIGNUP_TYPES = ['salon', 'restaurant', 'cafe', 'retail', 'manufacturing', 'stationery'];

// In-memory track of failed login attempts for brute-force protection
const failedLoginsMap = new Map();

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

/** One account → one business. Prefer Owner membership if legacy duplicates exist. */
async function getPrimaryBusinessPayload(userId) {
  const memberships = await Membership.find({ userId, status: 'active' }).populate('businessId');
  const valid = memberships.filter((m) => m.businessId);
  if (!valid.length) return null;

  const primary = valid.find((m) => m.role === 'Owner') || valid[0];
  const b = primary.businessId;
  const status = b.subscriptionStatus || 'Pending';
  return {
    id: b._id.toString(),
    name: b.name,
    businessName: b.name,
    slug: b.slug || (b.businessType === 'salon' ? 'glow-salon-studio' : `${b.businessType || 'retail'}-demo`),
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

/**
 * 1. Request Signup OTP / Resend OTP
 */
export const requestSignupOTP = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const existingOTP = await OTP.findOne({ email: cleanEmail, purpose: 'signup' });
  if (existingOTP && existingOTP.lastSentAt && (Date.now() - existingOTP.lastSentAt.getTime() < 60000)) {
    const waitSeconds = Math.ceil((60000 - (Date.now() - existingOTP.lastSentAt.getTime())) / 1000);
    return res.status(429).json({ error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` });
  }

  // Cryptographically secure 6-digit random generation
  const rawOTP = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(rawOTP, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Strict 5 minute expiration

  await OTP.findOneAndUpdate(
    { email: cleanEmail, purpose: 'signup' },
    { otpHash, expiresAt, attempts: 0, lastSentAt: new Date(), verified: false },
    { upsert: true, new: true }
  );

  await sendVerificationOTP({ email: cleanEmail, name, otp: rawOTP, purpose: 'signup' });

  res.json({
    success: true,
    message: 'Verification code sent to your email address (valid for 5 minutes).',
  });
});

/** Resend OTP Endpoint */
export const resendOTP = requestSignupOTP;

/**
 * 2. Verify Email / Signup OTP & Create Account
 */
export const verifySignupOTP = [
  ...registerValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, name, companyName, phone, businessType, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: 'Verification code (OTP) is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpRecord = await OTP.findOne({ email: cleanEmail, purpose: 'signup' });
    if (!otpRecord) {
      return res.status(400).json({ error: 'No pending OTP verification found for this email' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new verification code.' });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: 'Maximum verification attempts (5) exceeded. Please request a new OTP.' });
    }

    const isValid = await bcrypt.compare(otp.trim(), otpRecord.otpHash);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ error: `Invalid verification code. (${5 - otpRecord.attempts} attempts remaining)` });
    }

    // Invalidate OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    let type = String(businessType || '').toLowerCase();
    if (type === 'restaurant / cafe' || type === 'restaurant_cafe') type = 'restaurant';
    if (!ALLOWED_SIGNUP_TYPES.includes(type)) {
      type = 'general';
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: cleanEmail,
      passwordHash,
      phone: phone || '',
      emailVerified: true,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    const business = await Business.create({
      name: companyName,
      tradeName: companyName,
      ownerName: name,
      email: cleanEmail,
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

    const deviceDetails = parseDeviceDetails(req);
    await SecurityEvent.create({
      businessId: business._id,
      userId: user._id,
      userEmail: user.email,
      eventType: 'EMAIL_VERIFIED',
      timestamp: new Date(),
      ipAddress: deviceDetails.ipAddress,
      userAgent: deviceDetails.userAgent,
      device: deviceDetails.device,
      browser: deviceDetails.browser,
      operatingSystem: deviceDetails.operatingSystem,
      metadata: { method: 'Signup OTP Verification' },
    });

    const accessToken = await issueTokens(user, req, res);

    await logActivity({
      businessId: business._id,
      userId: user._id,
      userName: user.name,
      action: 'user.registered',
      entityType: 'User',
      entityId: user._id,
      details: `Registered ${business.name} (${type}) via OTP verification`,
      ip: req.ip,
    });

    // Send Welcome Email asynchronously
    sendWelcomeEmail({ email: cleanEmail, name, companyName }).catch((err) => {
      console.warn('Welcome email failure (non-blocking):', err.message);
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
      message: 'Account verified and created successfully! Welcome to Biizora.',
    });
  }),
];

/** Verify Email Alias */
export const verifyEmail = verifySignupOTP;

/** Direct Registration fallback */
export const register = verifySignupOTP;

/**
 * 3. Login Endpoint & Security Event Logging
 */
export const login = [
  ...loginValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const deviceDetails = parseDeviceDetails(req);

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      handleFailedLoginAttempt(cleanEmail, deviceDetails);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      handleFailedLoginAttempt(cleanEmail, deviceDetails);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset failed login count upon success
    failedLoginsMap.delete(cleanEmail);

    const accessToken = await issueTokens(user, req, res);
    const businessPayload = await getPrimaryBusinessPayload(user._id);

    // Record LOGIN Security Event
    const businessId = businessPayload?.id || null;
    if (businessId) {
      await SecurityEvent.create({
        businessId,
        userId: user._id,
        userEmail: user.email,
        eventType: 'LOGIN',
        timestamp: new Date(),
        ipAddress: deviceDetails.ipAddress,
        userAgent: deviceDetails.userAgent,
        device: deviceDetails.device,
        browser: deviceDetails.browser,
        operatingSystem: deviceDetails.operatingSystem,
        metadata: { loginType: 'Password' },
      });

      // Find Owner & send notification if logged-in user is NOT the owner
      const ownerMembership = await Membership.findOne({
        businessId,
        role: 'Owner',
        status: 'active',
      }).populate('userId');

      if (ownerMembership && ownerMembership.userId) {
        const ownerUser = ownerMembership.userId;
        // Notify owner if employee/staff logs in
        if (ownerUser._id.toString() !== user._id.toString()) {
          const userMembership = await Membership.findOne({ businessId, userId: user._id });
          const userRole = userMembership?.role || 'Employee';

          sendLoginAlert({
            toEmail: ownerUser.email,
            ownerName: ownerUser.name,
            userName: user.name,
            userEmail: user.email,
            userRole,
            businessName: businessPayload.name,
            timestamp: new Date(),
            ip: deviceDetails.ipAddress,
            device: deviceDetails.device,
            browser: deviceDetails.browser,
            os: deviceDetails.operatingSystem,
          }).catch((err) => {
            console.warn('Login alert email delivery error (non-blocking):', err.message);
          });
        }
      }
    }

    await logActivity({
      userId: user._id,
      userName: user.name,
      action: 'user.login',
      entityType: 'User',
      entityId: user._id,
      details: 'User logged in',
      ip: req.ip,
      businessId,
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

/** Helper for brute-force tracking & FAILED_LOGIN security alerts */
async function handleFailedLoginAttempt(email, deviceDetails) {
  const now = Date.now();
  const record = failedLoginsMap.get(email) || { count: 0, firstAttempt: now };

  // Reset window after 15 minutes
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    record.count = 0;
    record.firstAttempt = now;
  }

  record.count += 1;
  failedLoginsMap.set(email, record);

  if (record.count >= 5) {
    const user = await User.findOne({ email });
    if (user) {
      const businessPayload = await getPrimaryBusinessPayload(user._id);
      if (businessPayload?.id) {
        await SecurityEvent.create({
          businessId: businessPayload.id,
          userId: user._id,
          userEmail: user.email,
          eventType: 'FAILED_LOGIN',
          timestamp: new Date(),
          ipAddress: deviceDetails.ipAddress,
          userAgent: deviceDetails.userAgent,
          device: deviceDetails.device,
          browser: deviceDetails.browser,
          operatingSystem: deviceDetails.operatingSystem,
          metadata: { attemptsCount: record.count },
        });

        sendSecurityAlert({
          toEmail: user.email,
          ownerName: user.name,
          userEmail: user.email,
          eventType: 'FAILED_LOGIN',
          timestamp: new Date(),
          ip: deviceDetails.ipAddress,
          device: deviceDetails.device,
          browser: deviceDetails.browser,
          os: deviceDetails.operatingSystem,
          details: `5 consecutive failed login attempts were detected on your account within 15 minutes.`,
        }).catch((err) => {
          console.warn('Failed login security alert error (non-blocking):', err.message);
        });
      }
    }
  }
}

/**
 * 4. Explicit Logout & Security Event Logging
 */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const deviceDetails = parseDeviceDetails(req);

  if (req.user) {
    if (token) {
      const tokenHash = hashToken(token);
      req.user.refreshTokens = (req.user.refreshTokens || []).filter((t) => t.tokenHash !== tokenHash);
      await req.user.save();
    }

    const businessPayload = await getPrimaryBusinessPayload(req.user._id);
    if (businessPayload?.id) {
      await SecurityEvent.create({
        businessId: businessPayload.id,
        userId: req.user._id,
        userEmail: req.user.email,
        eventType: 'LOGOUT',
        timestamp: new Date(),
        ipAddress: deviceDetails.ipAddress,
        userAgent: deviceDetails.userAgent,
        device: deviceDetails.device,
        browser: deviceDetails.browser,
        operatingSystem: deviceDetails.operatingSystem,
        metadata: { logoutType: 'Explicit Logout' },
      });

      // Notify owner if a non-owner employee logs out
      const ownerMembership = await Membership.findOne({
        businessId: businessPayload.id,
        role: 'Owner',
        status: 'active',
      }).populate('userId');

      if (ownerMembership && ownerMembership.userId && ownerMembership.userId._id.toString() !== req.user._id.toString()) {
        sendLogoutAlert({
          toEmail: ownerMembership.userId.email,
          ownerName: ownerMembership.userId.name,
          userName: req.user.name,
          userEmail: req.user.email,
          timestamp: new Date(),
          ip: deviceDetails.ipAddress,
          device: deviceDetails.device,
          browser: deviceDetails.browser,
          os: deviceDetails.operatingSystem,
        }).catch((err) => {
          console.warn('Logout alert email delivery error:', err.message);
        });
      }
    }

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

  clearRefreshCookie(res);
  res.json({ success: true });
});

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

export const requestLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address' });
  }

  const existingOTP = await OTP.findOne({ email: cleanEmail, purpose: 'login' });
  if (existingOTP && existingOTP.lastSentAt && (Date.now() - existingOTP.lastSentAt.getTime() < 60000)) {
    const waitSeconds = Math.ceil((60000 - (Date.now() - existingOTP.lastSentAt.getTime())) / 1000);
    return res.status(429).json({ error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` });
  }

  const rawOTP = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(rawOTP, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.findOneAndUpdate(
    { email: cleanEmail, purpose: 'login' },
    { otpHash, expiresAt, attempts: 0, lastSentAt: new Date(), verified: false },
    { upsert: true, new: true }
  );

  await sendVerificationOTP({ email: cleanEmail, name: user.name, otp: rawOTP, purpose: 'login' });

  res.json({
    success: true,
    message: 'Login OTP sent to your email address.',
  });
});

export const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const otpRecord = await OTP.findOne({ email: cleanEmail, purpose: 'login' });
  if (!otpRecord) {
    return res.status(400).json({ error: 'No active login OTP found' });
  }

  if (otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (otpRecord.attempts >= 5) {
    return res.status(429).json({ error: 'Maximum attempts exceeded. Please request a new OTP.' });
  }

  const isValid = await bcrypt.compare(otp.trim(), otpRecord.otpHash);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    return res.status(400).json({ error: `Invalid OTP code. (${5 - otpRecord.attempts} attempts remaining)` });
  }

  await OTP.deleteOne({ _id: otpRecord._id });

  const accessToken = await issueTokens(user, req, res);
  const businessPayload = await getPrimaryBusinessPayload(user._id);

  const deviceDetails = parseDeviceDetails(req);
  if (businessPayload?.id) {
    await SecurityEvent.create({
      businessId: businessPayload.id,
      userId: user._id,
      userEmail: user.email,
      eventType: 'LOGIN',
      timestamp: new Date(),
      ipAddress: deviceDetails.ipAddress,
      userAgent: deviceDetails.userAgent,
      device: deviceDetails.device,
      browser: deviceDetails.browser,
      operatingSystem: deviceDetails.operatingSystem,
      metadata: { loginType: 'Passwordless Email OTP' },
    });
  }

  await logActivity({
    userId: user._id,
    userName: user.name,
    action: 'user.login_otp',
    entityType: 'User',
    entityId: user._id,
    details: 'User logged in via Email OTP',
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
});
