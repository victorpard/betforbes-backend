import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import userController from '../modules/users/user.controller';

const router = Router();

// Aliases antigos, apontando pro mesmo controller atual
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/me', authMiddleware, userController.getProfile);

export default router;
