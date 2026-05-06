import { Router } from 'express';
import productRoutes from './productRoutes.js';
import paymentRoutes from './paymentRoutes.js';

const router = Router();

router.use('/products', productRoutes);
router.use('/', paymentRoutes);

export default router;
