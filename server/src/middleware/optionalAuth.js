/**
 * Optional auth — attaches user when a valid Bearer token is present.
 */
import { verifyAccessToken } from '../utils/tokens.js';
import { User } from '../models/User.js';

export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return next();
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user) {
      req.user = user;
      req.userId = user._id;
    }
  } catch {
    /* ignore invalid tokens for public endpoints */
  }
  next();
}

/** Simple admin gate via ADMIN_EMAILS env (comma-separated). */
export function requireAdmin(req, res, next) {
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // In development, Owners of the demo can act as admin if ADMIN_EMAILS empty
  if (list.length === 0 && process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (!list.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
