import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';

const router = Router();

router.post('/orders', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

export default router;
