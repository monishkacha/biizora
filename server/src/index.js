import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { ensureDemoSeed } from './scripts/ensureDemoSeed.js';
import { ensureTenantDefaults } from './scripts/ensureTenantDefaults.js';
import { ensureSupportAgents } from './services/supportCenter.js';
import { closeStaleResolvedFeedback } from './services/feedbackService.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import businessRoutes from './routes/businesses.js';
import membersRoutes from './routes/members.js';
import customersRoutes from './routes/customers.js';
import productsRoutes from './routes/products.js';
import invoicesRoutes from './routes/invoices.js';
import expensesRoutes from './routes/expenses.js';
import searchRoutes from './routes/search.js';
import notificationsRoutes from './routes/notifications.js';
import activityRoutes from './routes/activity.js';
import feedbackRoutes from './routes/feedback.js';
import supportRoutes from './routes/support.js';
import migrationRoutes from './routes/migration.js';
import adminRoutes from './routes/admin.js';
import modulesRoutes from './routes/modules.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'Biizora API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/modules', modulesRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();
  await ensureTenantDefaults();
  await ensureDemoSeed();
  await ensureSupportAgents();

  // Auto-close resolved feedback with no further replies
  const runAutoClose = () => {
    closeStaleResolvedFeedback().catch((err) => console.error('Feedback auto-close failed:', err));
  };
  runAutoClose();
  setInterval(runAutoClose, 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`✓ Biizora API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start Biizora API:', err);
  process.exit(1);
});
