import { Router } from 'express';
import OrdersController from './orders.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// todas as rotas de ordem requerem autenticação
router.use(authenticate);

router.post('/orders', OrdersController.create);
router.get('/orders', OrdersController.list);
router.post('/orders/:id/close', OrdersController.close);

export default router;

