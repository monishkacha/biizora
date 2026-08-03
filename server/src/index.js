import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database Store for Instant Production & Fallback Execution
let dbInvoices = [
  { id: "inv-101", invoiceNumber: "INV-2026-001", customerName: "Apex Global Solutions", grandTotal: 112097.64, status: "paid" },
  { id: "inv-102", invoiceNumber: "INV-2026-002", customerName: "Zenith Digital Media", grandTotal: 88500, status: "paid" },
  { id: "inv-103", invoiceNumber: "INV-2026-003", customerName: "Nova Retail & Logistics", grandTotal: 94900, status: "overdue" },
  { id: "inv-104", invoiceNumber: "INV-2026-004", customerName: "Kaveri Engineering Works", grandTotal: 14350, status: "pending" }
];

let dbCustomers = [
  { id: "cust-1", name: "Apex Global Solutions", gstin: "27AAACA1234A1Z1", totalSpent: 380000, outstandingBalance: 45000 },
  { id: "cust-2", name: "Zenith Digital Media", gstin: "29BBBCB5678B1Z2", totalSpent: 195000, outstandingBalance: 0 }
];

const JWT_SECRET = process.env.JWT_SECRET || 'amexora_jwt_secret_key_2026';

// Middleware for JWT Verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden invalid token' });
    req.user = user;
    next();
  });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'Amexora AI Financial OS API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication Endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Dummy JWT sign
  const userPayload = {
    id: "usr-100",
    name: email.split('@')[0].toUpperCase(),
    email: email,
    role: "Owner",
    companyName: "Amexora Technologies Pvt Ltd"
  };

  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: userPayload });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, companyName } = req.body;
  const userPayload = {
    id: `usr-${Date.now()}`,
    name: name || 'New Founder',
    email,
    role: "Owner",
    companyName: companyName || 'My Business'
  };

  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: userPayload });
});

// Invoices REST Endpoints
app.get('/api/invoices', (req, res) => {
  res.json({ success: true, count: dbInvoices.length, data: dbInvoices });
});

app.post('/api/invoices', (req, res) => {
  const newInv = { id: `inv-${Date.now()}`, ...req.body };
  dbInvoices.unshift(newInv);
  res.status(201).json({ success: true, data: newInv });
});

app.put('/api/invoices/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  dbInvoices = dbInvoices.map(i => i.id === id ? { ...i, status } : i);
  res.json({ success: true, message: `Invoice ${id} updated to ${status}` });
});

// Customers REST Endpoints
app.get('/api/customers', (req, res) => {
  res.json({ success: true, data: dbCustomers });
});

app.post('/api/customers', (req, res) => {
  const newCust = { id: `cust-${Date.now()}`, ...req.body };
  dbCustomers.unshift(newCust);
  res.status(201).json({ success: true, data: newCust });
});

// AI Financial Advisor Endpoint
app.post('/api/ai/forecast', (req, res) => {
  const { currentRevenue } = req.body;
  const rev = Number(currentRevenue) || 485000;
  
  res.json({
    success: true,
    forecast: {
      days7: Math.round(rev * 1.05),
      days30: Math.round(rev * 1.15),
      days90: Math.round(rev * 1.35),
      confidenceScore: 0.94,
      keyDrivers: ["Enterprise retainer renewals", "Fast UPI settlement"]
    }
  });
});

// Razorpay Order Simulation Endpoint
app.post('/api/payments/create-order', (req, res) => {
  const { amount, invoiceNumber } = req.body;
  res.json({
    id: `order_${Date.now()}`,
    entity: "order",
    amount: amount * 100, // In paise
    currency: "INR",
    receipt: invoiceNumber || "receipt_1",
    status: "created"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Amexora AI Financial Server running on port ${PORT}`);
});
