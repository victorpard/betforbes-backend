import express from 'express';
import authService, { RegisterData, LoginData } from './auth.service';
import { createError } from '../../middlewares/errorHandler';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const data: RegisterData = req.body;
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data: LoginData = req.body;
    const result = await authService.login(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerification(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
