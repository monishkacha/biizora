/**
 * Brevo Email Service Abstraction
 * Handles transactional emails (Signup OTP, Login OTP, Welcome Emails) via Brevo HTTP API.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send an email via Brevo REST API. If BREVO_API_KEY is omitted, fallback to console log (dev mode).
 */
export async function sendEmail({ to, subject, htmlContent, textContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM || 'no-reply@biizora.com';
  const senderName = process.env.EMAIL_FROM_NAME || 'Biizora';

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
      throw new Error(`Brevo API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId, mode: 'brevo' };
  } catch (error) {
    console.error(`[Email Service Failure] Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Send 6-digit OTP verification code email.
 */
export async function sendOTPEmail({ email, name, otp, purpose = 'signup' }) {
  const subject = purpose === 'login' ? 'Your Biizora Login Verification Code' : 'Your Biizora Verification Code';
  const title = purpose === 'login' ? 'Login Verification Code' : 'Verify Your Biizora Account';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f7f7; margin: 0; padding: 40px 20px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; padding: 36px; color: #171717; }
        .header { text-align: center; margin-bottom: 28px; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #171717; text-decoration: none; }
        .badge { display: inline-block; background: #15803d; color: #ffffff; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 99px; margin-left: 8px; vertical-align: middle; }
        .otp-box { background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; text-align: center; padding: 20px; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #15803d; font-family: monospace; }
        .note { font-size: 13px; color: #737373; line-height: 1.5; margin-top: 24px; text-align: center; }
        .footer { text-align: center; font-size: 12px; color: #a3a3a3; margin-top: 32px; border-top: 1px solid #f5f5f5; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="logo">Biizora<span class="badge">SECURE</span></span>
        </div>
        <h2 style="margin-top:0; font-size: 20px; text-align: center;">${title}</h2>
        <p style="font-size: 14px; color: #404040; line-height: 1.6;">Hi ${name || 'there'},</p>
        <p style="font-size: 14px; color: #404040; line-height: 1.6;">Use the verification code below to complete your authentication request on Biizora. This code is valid for <strong>10 minutes</strong>.</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>

        <p style="font-size: 13px; color: #737373; text-align: center;">If you did not request this code, please ignore this email.</p>
        
        <div class="footer">
          © ${new Date().getFullYear()} Biizora Technologies Pvt Ltd. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    htmlContent,
    textContent: `Your Biizora verification code is: ${otp}. It expires in 10 minutes.`,
  });
}

/**
 * Send Welcome Email upon successful signup and OTP verification.
 */
export async function sendWelcomeEmail({ email, name, companyName }) {
  const subject = 'Welcome to the Biizora Family 🚀';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f7f7; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; padding: 36px; color: #171717; }
        .logo { font-size: 26px; font-weight: 800; color: #171717; }
        .hero { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; background: #15803d; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 16px; font-size: 14px; }
        .footer { text-align: center; font-size: 12px; color: #a3a3a3; margin-top: 32px; border-top: 1px solid #f5f5f5; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Biizora 🚀</div>
        <h2 style="font-size: 22px; margin-top: 16px;">Welcome aboard, ${name}!</h2>
        <p style="font-size: 14px; color: #404040; line-height: 1.6;">
          Thank you for joining Biizora. Your business workspace <strong>${companyName || 'your business'}</strong> is now verified and active!
        </p>
        
        <div class="hero">
          <h3 style="margin-top: 0; color: #166534; font-size: 16px;">Meet Bizz — Your Intelligent Business Co-Pilot 🤖</h3>
          <p style="margin-bottom: 0; font-size: 13px; color: #15803d; line-height: 1.5;">
            Bizz AI is ready to help you manage your cash flow, track inventory, issue GST invoices, and optimize profits in both <strong>English and Gujarati (ગુજરાતી)</strong>.
          </p>
        </div>

        <p style="font-size: 14px; color: #404040; line-height: 1.6;">
          Here is what you can do right away:
        </p>
        <ul style="font-size: 14px; color: #404040; line-height: 1.8;">
          <li>Create beautiful GST invoices in under 30 seconds</li>
          <li>Track customers, suppliers, and pending receivables</li>
          <li>Ask Bizz AI natural language questions about your business numbers</li>
        </ul>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${process.env.APP_URL || 'http://localhost:5173'}/app" class="btn">Go to Dashboard</a>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} Biizora Technologies Pvt Ltd. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    htmlContent,
    textContent: `Welcome to Biizora, ${name}! Your workspace ${companyName} is ready.`,
  });
}
