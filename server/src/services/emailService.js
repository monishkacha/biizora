/**
 * Brevo Email Service & Premium HTML Email System for Biizora
 * 
 * Visual Identity:
 * - Outer background: Warm cream (#FBF9F5)
 * - Inner card: Pure white (#FFFFFF) with soft border (#E5E0D8) and 16px radius
 * - Primary brand color: Dark Biizora green (#0F382C)
 * - Accent: Gold dot / highlight (#D4AF37 / #E6C687)
 * - Typography: Clean sans-serif, lowercase "biizora" wordmark
 * - Email-safe table layouts compatible with Gmail (desktop/mobile), Outlook, Apple Mail
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Core Brevo Email Delivery Handler (preserves working Brevo API integration)
 */
export async function sendEmail({ to, subject, htmlContent, textContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'biizoraos@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || process.env.EMAIL_FROM_NAME || 'Biizora';

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_key_here') {
    console.log(`\n=================== [DEV EMAIL FALLBACK] ===================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (text): ${textContent || 'HTML content provided'}`);
    console.log(`============================================================\n`);
    return { success: true, mode: 'dev-fallback' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey.trim(),
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || subject,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Brevo Email Error] HTTP ${response.status}: ${errText}`);
      return { success: false, error: `Brevo API Error (${response.status}): ${errText}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId, mode: 'brevo' };
  } catch (error) {
    console.error(`[Email Service Failure] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Reusable Master Layout Container for all Biizora Emails
 */
function wrapEmailTemplate({ preheaderText = '', contentHtml }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Biizora</title>
  <style type="text/css">
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #FBF9F5; }

    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .content-card { padding: 24px 18px !important; border-radius: 14px !important; }
      .otp-code { font-size: 32px !important; letter-spacing: 8px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717;">

  <!-- Hidden Preview Preheader Text for Inbox -->
  <div style="display:none; font-size:1px; color:#FBF9F5; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
    ${preheaderText}
  </div>

  <!-- Outer Canvas Table -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBF9F5; padding: 36px 12px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Centered Responsive Email Box (600px Max Width) -->
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td class="content-card" style="background-color: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 18px; padding: 36px; box-shadow: 0 4px 20px rgba(15, 56, 44, 0.03);">
              
              <!-- Minimal Biizora Brand Header -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid #F0ECE4; padding-bottom: 20px; margin-bottom: 28px;">
                <tr>
                  <td align="left" valign="middle">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.03em; color: #0F382C; text-decoration: none;">biizora<span style="color: #D4AF37;">.</span></span>
                  </td>
                </tr>
              </table>

              <!-- Main Dynamic Content -->
              ${contentHtml}

              <!-- Subtle Footer Section -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px; border-top: 1px solid #F0ECE4; padding-top: 24px;">
                <tr>
                  <td align="left" style="font-size: 11px; color: #8C857B; line-height: 1.6;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #0F382C; letter-spacing: -0.02em; margin-bottom: 4px;">biizora<span style="color: #D4AF37;">.</span></div>
                    <div style="margin-bottom: 4px;">Calm AI Operating System for Indian Businesses.</div>
                    <div>© ${new Date().getFullYear()} Biizora Technologies Pvt Ltd. All rights reserved. • Security & account notifications</div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * 1. Send OTP Verification Email (Signup & Passwordless Login)
 */
export async function sendVerificationOTP({ email, name, otp, purpose = 'signup' }) {
  const isLogin = purpose === 'login';
  const subject = isLogin ? 'Your Biizora security code' : 'Your Biizora verification code';
  const preheaderText = `Your secure Biizora verification code expires in 5 minutes.`;

  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; color: #171717; margin: 0 0 6px 0;">
      ${isLogin ? 'Login Verification' : 'Welcome to Biizora'}
    </h1>
    <p style="font-size: 14px; color: #666666; margin: 0 0 20px 0; line-height: 1.5;">
      Let's verify your email address.
    </p>

    <p style="font-size: 14px; color: #333333; line-height: 1.6; margin: 0 0 24px 0;">
      Hi ${name || 'there'},<br>
      You're one step away from activating your Biizora workspace. Use the verification code below:
    </p>

    <!-- Visual OTP Container Card -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F6F0; border: 1px solid #E5E0D8; border-radius: 14px; margin: 24px 0; text-align: center;">
      <tr>
        <td style="padding: 26px 16px;">
          <div class="otp-code" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #0F382C; margin-bottom: 8px;">
            ${otp}
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #857B6E;">
            This code expires in 5 minutes.
          </div>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #777777; line-height: 1.5; margin-top: 24px;">
      If you didn't request this code, you can safely ignore this email.
    </p>
  `;

  const htmlContent = wrapEmailTemplate({ preheaderText, contentHtml });
  return sendEmail({
    to: email,
    subject,
    htmlContent,
    textContent: `Your Biizora verification code is: ${otp}. It expires in 5 minutes.`,
  });
}

/** Legacy export alias for compatibility */
export const sendOTPEmail = sendVerificationOTP;

/**
 * 2. Send Welcome Email upon successful signup and OTP verification
 */
export async function sendWelcomeEmail({ email, name, companyName }) {
  const subject = 'Welcome to the Biizora family 🎉';
  const preheaderText = 'Your Biizora business workspace is ready.';
  const appUrl = process.env.APP_URL || process.env.PUBLIC_URL || 'http://localhost:5173';

  const contentHtml = `
    <h1 style="font-size: 24px; font-weight: 700; color: #171717; margin: 0 0 6px 0;">
      Welcome to the Biizora family.
    </h1>
    <p style="font-size: 14px; font-weight: 600; color: #0F382C; margin: 0 0 20px 0;">
      Your business workspace is ready.
    </p>

    <p style="font-size: 14px; color: #333333; line-height: 1.6; margin: 0 0 24px 0;">
      Hi ${name || 'there'},<br><br>
      Welcome aboard. Your workspace <strong>${companyName || 'your business'}</strong> is now verified and ready to use. You now have one place to manage the everyday operations of your business.
    </p>

    <!-- Clean Feature Cards Section -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td style="padding: 12px 14px; background: #F9F7F2; border: 1px solid #E5E0D8; border-radius: 12px; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #0F382C; uppercase; tracking: 0.05em; margin-bottom: 2px;">INVOICING</div>
          <div style="font-size: 13px; color: #444444;">Create professional GST-ready invoices in seconds.</div>
        </td>
      </tr>
      <tr><td height="8"></td></tr>
      <tr>
        <td style="padding: 12px 14px; background: #F9F7F2; border: 1px solid #E5E0D8; border-radius: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #0F382C; uppercase; tracking: 0.05em; margin-bottom: 2px;">CASH FLOW</div>
          <div style="font-size: 13px; color: #444444;">Understand where your money is going with live metrics.</div>
        </td>
      </tr>
      <tr><td height="8"></td></tr>
      <tr>
        <td style="padding: 12px 14px; background: #F9F7F2; border: 1px solid #E5E0D8; border-radius: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #0F382C; uppercase; tracking: 0.05em; margin-bottom: 2px;">INVENTORY</div>
          <div style="font-size: 13px; color: #444444;">Know what is available before it becomes a problem.</div>
        </td>
      </tr>
      <tr><td height="8"></td></tr>
      <tr>
        <td style="padding: 12px 14px; background: #F9F7F2; border: 1px solid #E5E0D8; border-radius: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #0F382C; uppercase; tracking: 0.05em; margin-bottom: 2px;">BIZZ AI</div>
          <div style="font-size: 13px; color: #444444;">Ask questions about your business in natural language.</div>
        </td>
      </tr>
      <tr><td height="8"></td></tr>
      <tr>
        <td style="padding: 12px 14px; background: #F9F7F2; border: 1px solid #E5E0D8; border-radius: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #0F382C; uppercase; tracking: 0.05em; margin-bottom: 2px;">GROWTH ENGINE</div>
          <div style="font-size: 13px; color: #444444;">Discover opportunities your business may be missing.</div>
        </td>
      </tr>
    </table>

    <!-- Strong CTA Button -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px; text-align: center;">
      <tr>
        <td align="center">
          <a href="${appUrl}/app" style="display: inline-block; background-color: #0F382C; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(15,56,44,0.15);">Open My Biizora Workspace →</a>
        </td>
      </tr>
    </table>

    <p style="font-size: 14px; color: #333333; line-height: 1.6; margin-top: 32px;">
      We're glad to have you with us.<br>
      Here's to building a smarter, calmer business.<br><br>
      <strong>— Team Biizora</strong>
    </p>
  `;

  const htmlContent = wrapEmailTemplate({ preheaderText, contentHtml });
  return sendEmail({
    to: email,
    subject,
    htmlContent,
    textContent: `Welcome to the Biizora family! Your workspace ${companyName || ''} is verified and ready.`,
  });
}

/**
 * 3. Send New Login Detection Alert
 */
export async function sendLoginAlert({
  toEmail,
  ownerName,
  userName,
  userEmail,
  timestamp = new Date(),
  ip = '127.0.0.1',
  device = 'Desktop',
  browser = 'Chrome',
  os = 'Windows',
}) {
  const formattedTime = new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  const subject = 'New sign-in to your Biizora account';
  const preheaderText = 'A new sign-in was detected on your Biizora account.';

  const contentHtml = `
    <div style="font-size: 11px; font-weight: 700; color: #D4AF37; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;">SECURITY ALERT</div>
    <h1 style="font-size: 20px; font-weight: 700; color: #171717; margin: 0 0 16px 0;">
      A new sign-in was detected.
    </h1>

    <p style="font-size: 14px; color: #333333; line-height: 1.6; margin-bottom: 20px;">
      Hi ${ownerName || userName || 'User'},<br>
      Your Biizora account was signed in successfully.
    </p>

    <!-- Info Table Card -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F6F0; border: 1px solid #E5E0D8; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">Account:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right;">${userEmail || toEmail}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">Time:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right;">${formattedTime} IST</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">Device:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right;">${device} (${os})</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">Browser:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right;">${browser}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">IP Address:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right; font-family: monospace;">${ip}</td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #666666; line-height: 1.5;">
      If you recognize this activity, no action is required.<br>
      If you don't recognize it, secure your account immediately by changing your password.
    </p>
  `;

  const htmlContent = wrapEmailTemplate({ preheaderText, contentHtml });
  return sendEmail({
    to: toEmail,
    subject,
    htmlContent,
    textContent: `New sign-in to your Biizora account (${userEmail || toEmail}) at ${formattedTime} from ${ip} (${device}/${browser}).`,
  });
}

/**
 * 4. Send Logout Security Alert Email
 */
export async function sendLogoutAlert({
  toEmail,
  ownerName,
  userName,
  userEmail,
  timestamp = new Date(),
  device = 'Desktop',
  browser = 'Chrome',
}) {
  const formattedTime = new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  const subject = 'Your Biizora account was signed out';
  const preheaderText = 'Your Biizora account was signed out.';

  const contentHtml = `
    <div style="font-size: 11px; font-weight: 700; color: #857B6E; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;">SIGNED OUT</div>
    <h1 style="font-size: 20px; font-weight: 700; color: #171717; margin: 0 0 16px 0;">
      Your Biizora account was signed out.
    </h1>

    <p style="font-size: 14px; color: #333333; line-height: 1.6; margin-bottom: 20px;">
      Hi ${ownerName || userName || 'User'},<br>
      Your Biizora session was closed.
    </p>

    <!-- Info Table Card -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F6F0; border: 1px solid #E5E0D8; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">Account:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right;">${userEmail || toEmail}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">Time:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right;">${formattedTime} IST</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666; font-weight: 500;">Device:</td>
        <td style="padding: 6px 0; color: #171717; font-weight: 600; text-align: right;">${device} (${browser})</td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #666666; line-height: 1.5;">
      If this was you, no action is required.
    </p>
  `;

  const htmlContent = wrapEmailTemplate({ preheaderText, contentHtml });
  return sendEmail({
    to: toEmail,
    subject,
    htmlContent,
    textContent: `Your Biizora account (${userEmail || toEmail}) was signed out at ${formattedTime}.`,
  });
}

/**
 * 5. Send Password Reset Email
 */
export async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const subject = 'Reset your Biizora password';
  const preheaderText = 'Use this secure link to reset your Biizora account password.';

  const contentHtml = `
    <div style="font-size: 11px; font-weight: 700; color: #0F382C; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;">PASSWORD RESET</div>
    <h1 style="font-size: 20px; font-weight: 700; color: #171717; margin: 0 0 16px 0;">
      Reset your Biizora password
    </h1>

    <p style="font-size: 14px; color: #333333; line-height: 1.6; margin: 0 0 24px 0;">
      Hi ${name || 'User'},<br><br>
      We received a request to reset the password for your Biizora account. Click the button below to choose a new password:
    </p>

    <!-- Reset CTA Button -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0; text-align: center;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display: inline-block; background-color: #0F382C; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(15,56,44,0.15);">Reset Password →</a>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #666666; line-height: 1.5;">
      This link is valid for 15 minutes. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.
    </p>
  `;

  const htmlContent = wrapEmailTemplate({ preheaderText, contentHtml });
  return sendEmail({
    to: email,
    subject,
    htmlContent,
    textContent: `Reset your Biizora password using this link: ${resetUrl}. Valid for 15 minutes.`,
  });
}

/**
 * 6. Send Generic Critical Security Threshold Alert
 */
export async function sendSecurityAlert({
  toEmail,
  ownerName,
  userEmail,
  eventType = 'FAILED_LOGIN',
  timestamp = new Date(),
  ip = '127.0.0.1',
  device = 'Desktop',
  browser = 'Chrome',
  os = 'Windows',
  details = 'Multiple failed authentication attempts detected.',
}) {
  const formattedTime = new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  const subject = `Security alert for your Biizora account`;
  const preheaderText = `Security alert regarding event ${eventType}.`;

  const contentHtml = `
    <div style="font-size: 11px; font-weight: 700; color: #B91C1C; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;">SECURITY ALERT</div>
    <h1 style="font-size: 20px; font-weight: 700; color: #171717; margin: 0 0 16px 0;">
      Security Event Detected
    </h1>

    <p style="font-size: 14px; color: #B91C1C; font-weight: 600; line-height: 1.6; margin-bottom: 20px;">
      ${details}
    </p>

    <!-- Info Table Card -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Target Email:</td>
        <td style="padding: 6px 0; color: #991B1B; font-weight: 600; text-align: right;">${userEmail || toEmail}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Event Type:</td>
        <td style="padding: 6px 0; color: #991B1B; font-weight: 600; text-align: right;">${eventType}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Timestamp:</td>
        <td style="padding: 6px 0; color: #991B1B; font-weight: 600; text-align: right;">${formattedTime} IST</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">IP Address:</td>
        <td style="padding: 6px 0; color: #991B1B; font-weight: 600; text-align: right; font-family: monospace;">${ip}</td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #666666; line-height: 1.5;">
      Biizora automated rate-limiting has throttled additional requests. If you believe your account is compromised, please reset your password immediately.
    </p>
  `;

  const htmlContent = wrapEmailTemplate({ preheaderText, contentHtml });
  return sendEmail({
    to: toEmail,
    subject,
    htmlContent,
    textContent: `Security alert (${eventType}): ${details} for ${userEmail || toEmail} at ${formattedTime} from ${ip}.`,
  });
}

