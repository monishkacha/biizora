/**
 * Device & User Agent Metadata Parser
 * Extracts browser, operating system, device type, and clean IP address from HTTP requests.
 */

export function parseDeviceDetails(req) {
  const ua = req.headers['user-agent'] || '';
  
  // Extract clean IP
  let rawIp = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '127.0.0.1';
  if (rawIp.includes(',')) {
    rawIp = rawIp.split(',')[0].trim();
  }
  if (rawIp === '::1' || rawIp === '::ffff:127.0.0.1') {
    rawIp = '127.0.0.1';
  }

  // Parse Operating System
  let operatingSystem = 'Unknown OS';
  if (/windows/i.test(ua)) operatingSystem = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) operatingSystem = 'macOS';
  else if (/android/i.test(ua)) operatingSystem = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) operatingSystem = 'iOS';
  else if (/linux/i.test(ua)) operatingSystem = 'Linux';
  else if (/cros/i.test(ua)) operatingSystem = 'ChromeOS';

  // Parse Browser
  let browser = 'Unknown Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';

  // Parse Device Category
  let device = 'Desktop';
  if (/mobile/i.test(ua) && !/ipad|tablet/i.test(ua)) device = 'Mobile';
  else if (/ipad|tablet/i.test(ua) || (/macintosh/i.test(ua) && 'ontouchend' in {})) device = 'Tablet';

  return {
    ipAddress: rawIp,
    userAgent: ua,
    device,
    browser,
    operatingSystem,
  };
}
