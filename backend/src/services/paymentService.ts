import razorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

class PaymentService {
  async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    try {
      const order = await razorpayInstance.orders.create(orderOptions);
      logger.info(`Razorpay Order Created: ${order.id}`);
      return order;
    } catch (error: any) {
      logger.error(`Razorpay Order Creation Error: ${error.message}`);
      throw new Error('Failed to create Razorpay order');
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    try {
      const sign = orderId + "|" + paymentId;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(sign.toString())
        .digest("hex");

      if (signature === expectedSign) {
        logger.info(`Payment Verified: ${paymentId}`);
        return true;
      } else {
        logger.error(`Invalid Signature for payment: ${paymentId}`);
        return false;
      }
    } catch (error: any) {
      logger.error(`Verification Error: ${error.message}`);
      throw new Error('Payment verification failed');
    }
  }
}

export default new PaymentService();
