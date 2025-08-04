import { Router } from 'express';
import AuthService, { RegisterData, LoginData } from './auth.service';
const router = Router();
const service = new AuthService();

// Registrar
router.post('/register', async (req, res, next) => {
  try {
    const data: RegisterData = req.body;
    const result = await service.register(data);
    res.json({ success: true, user: result.user, emailSent: result.emailSent });
  } catch (e) {
    next(e);
  }
});

// Verificar email (token via query param ?token=...)
router.get('/verify-email', async (req, res, next) => {
  try {
    const token = String(req.query.token || '');
    const result = await service.verifyEmail(token);
    res.json({ success: true, user: result.user });
  } catch (e) {
    next(e);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data: LoginData = req.body;
    const result = await service.login(data);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

export default router;
