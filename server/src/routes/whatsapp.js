import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import twilio from 'twilio';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/invoices';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname || `invoice-${Date.now()}.pdf`);
  }
});

const upload = multer({ storage });

router.post('/send-whatsapp-invoice', upload.single('invoice'), async (req, res) => {
  try {
    const { customerName, phone } = req.body;
    const file = req.file;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'PDF invoice file is required' });
    }

    const filename = file.filename;
    const pdfPublicUrl = `${req.protocol}://${req.get('host')}/public/invoices/${filename}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.log('Twilio credentials missing. Simulating WhatsApp sending with PDF:');
      console.log('To:', phone);
      console.log('Media URL:', pdfPublicUrl);
      return res.json({
        success: true,
        message: 'Simulated WhatsApp sending (Twilio credentials missing)',
        pdfUrl: pdfPublicUrl,
      });
    }

    const client = twilio(accountSid, authToken);
    const formattedPhone = phone.replace(/\D/g, '').replace(/^0+/, '');

    await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio Sandbox Number
      to: `whatsapp:+91${formattedPhone}`,
      body: `Hello ${customerName || 'Customer'}, your salon invoice is attached.`,
      mediaUrl: [pdfPublicUrl],
    });

    res.json({
      success: true,
      message: 'WhatsApp invoice sent successfully',
      pdfUrl: pdfPublicUrl,
    });
  } catch (err) {
    console.error('WhatsApp dispatch error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

export default router;
