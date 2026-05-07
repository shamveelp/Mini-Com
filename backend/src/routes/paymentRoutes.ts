import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';
import { rateLimiter } from '../utils/rateLimiter.js';

const router = Router();

// Limit to 5 requests per minute for order creation
router.post('/orders', rateLimiter(5, 60000), paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

export default router;
