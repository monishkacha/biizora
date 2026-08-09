import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requireActiveSubscription } from '../middleware/requireBusiness.js';
import multer from 'multer';

import {
  parseImportFile,
  processImport,
  getHistory,
  undoMigration,
  exportData,
  getSampleTemplate,
  createBackup,
} from '../controllers/migrationController.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.use(authenticate);
router.use(requireBusiness, requireActiveSubscription);

router.post('/parse', upload.single('file'), parseImportFile);
router.post('/process', processImport);
router.get('/history', getHistory);
router.post('/undo/:id', undoMigration);
router.get('/export', exportData);
router.get('/templates/:type', getSampleTemplate);
router.post('/backup', createBackup);

export default router;
