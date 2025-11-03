import { Router } from 'express';
import { authMiddleware } from '../modules/auth/auth.middleware';
import userController from '../modules/users/user.controller';

const router = Router();

// Aliases antigos, apontando pro mesmo controller atual
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/me', authMiddleware, userController.getProfile);

export default router;
