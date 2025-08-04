import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
} from '../modules/auth/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
