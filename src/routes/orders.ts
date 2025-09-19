import { Router } from 'express';
import ordersRouter from '../modules/orders/orders.router';

const router = Router();

// Reexporta o router real dos módulos
router.use('/', ordersRouter);

export default router;
