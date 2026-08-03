import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.post('/accept-invite', auth.acceptInvite);
router.post('/logout', authenticate, auth.logout);
router.get('/me', authenticate, auth.me);
router.patch('/profile', authenticate, auth.updateProfile);

export default router;
