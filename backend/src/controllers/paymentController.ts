import type { Request, Response } from 'express';
import paymentService from '../services/paymentService.js';

class PaymentController {
  async createOrder(req: Request, res: Response) {
    const { amount, currency, receipt, idempotencyKey } = req.body;
    
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    try {
      const order = await paymentService.createOrder(amount, currency, receipt, idempotencyKey);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPaymentStatus(req: Request, res: Response) {
    const customId = req.params.customId as string;
    if (!customId) return res.status(400).json({ message: 'Custom ID is required' });

    try {
      const status = await paymentService.getPaymentByCustomId(customId);
      res.json(status);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async verifyPayment(req: Request, res: Response) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing verification data' });
    }

    try {
      const isValid = await paymentService.verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (isValid) {
        res.status(200).json({ message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ message: 'Invalid signature' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try {
      // Razorpay sends webhook signature in 'x-razorpay-signature' header
      const signature = req.headers['x-razorpay-signature'] as string;
      await paymentService.handleWebhook(req.body, signature);
      res.status(200).send('OK');
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new PaymentController();
