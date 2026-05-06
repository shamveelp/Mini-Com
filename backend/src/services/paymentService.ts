import razorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import paymentRepository from '../repositories/paymentRepository.js';
import Payment, { type IPayment, PaymentStatus } from '../models/Payment.js';
import gatewaySimulator from './gatewaySimulator.js';
import { sleep, exponentialBackoff } from '../utils/common.js';

class PaymentService {
  private readonly MAX_RETRIES = 3;

  async createOrder(amount: number, currency: string = 'INR', receipt?: string, idempotencyKey?: string) {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const existing = await paymentRepository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        logger.info(`Idempotent request detected for key: ${idempotencyKey}`);
        return {
          id: existing.razorpayOrderId,
          amount: existing.amount,
          currency: existing.currency,
          status: existing.status,
          isDuplicate: true
        };
      }
    }

    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    try {
      // 2. Create Razorpay Order
      const order = await razorpayInstance.orders.create(orderOptions);
      
      // 3. Initialize Payment Record (PENDING)
      if (idempotencyKey) {
        await paymentRepository.create({
          orderId: order.receipt || `receipt_${Date.now()}`,
          razorpayOrderId: order.id,
          amount: Number(order.amount),
          currency: order.currency,
          status: PaymentStatus.PENDING,
          idempotencyKey,
          attempts: 0
        });
      }

      logger.info(`Razorpay Order Created & Initialized: ${order.id}`);
      return order;
    } catch (error: any) {
      logger.error(`Order Creation Error: ${error.message}`);
      throw new Error('Failed to initialize payment process');
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    // 4. Concurrency Control & Atomic Transition
    const payment = await paymentRepository.findByRazorpayOrderId(orderId);
    if (!payment) throw new Error('Payment record not found');

    if (payment.status === PaymentStatus.SUCCESS) return true;
    if (payment.status === PaymentStatus.FAILED) throw new Error('Payment already failed');

    // Attempt to move to PROCESSING
    const processingPayment = await paymentRepository.transitionStatus(
      payment._id.toString(),
      [PaymentStatus.PENDING],
      PaymentStatus.PROCESSING
    );

    if (!processingPayment) {
      // If transition failed, someone else is already processing this payment
      logger.warn(`Concurrency block: Payment ${orderId} is already being processed`);
      throw new Error('Payment is currently being processed');
    }

    try {
      // 5. Signature Verification (Security)
      const sign = orderId + "|" + paymentId;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(sign.toString())
        .digest("hex");

      if (signature !== expectedSign) {
        await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.FAILED, {
          lastError: 'Invalid Signature'
        });
        return false;
      }

      // 6. External Gateway Simulation with Retry Logic
      let success = false;
      let attempt = 0;

      while (attempt < this.MAX_RETRIES && !success) {
        try {
          await gatewaySimulator.processPayment(payment.amount);
          success = true;
        } catch (error: any) {
          attempt++;
          logger.error(`Gateway Attempt ${attempt} failed: ${error.message}`);
          
          if (attempt < this.MAX_RETRIES) {
            const delay = exponentialBackoff(attempt);
            logger.info(`Retrying in ${delay}ms...`);
            await sleep(delay);
          } else {
            throw error;
          }
        }
      }

      // 7. Final Status Update
      await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.SUCCESS, {
        razorpayPaymentId: paymentId
      });

      return true;
    } catch (error: any) {
      logger.error(`Verification/Processing Error: ${error.message}`);
      await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.FAILED, {
        lastError: error.message
      });
      throw error;
    }
  }

  // 8. Webhook Handling
  async handleWebhook(payload: any, signature: string) {
    // In a real app, verify Razorpay webhook signature here
    const { event, payload: eventData } = payload;
    const razorpayOrderId = eventData.payment.entity.order_id;

    logger.info(`Webhook received: ${event} for order ${razorpayOrderId}`);

    const payment = await paymentRepository.findByRazorpayOrderId(razorpayOrderId);
    if (!payment) return;

    // Handle conflicting states
    if (payment.status === PaymentStatus.SUCCESS) {
      logger.info('Payment already successful, ignoring webhook');
      return;
    }

    if (event === 'payment.captured') {
      await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.SUCCESS, {
        razorpayPaymentId: eventData.payment.entity.id
      });
    } else if (event === 'payment.failed') {
      await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.FAILED, {
        lastError: 'Webhook: Payment failed at Razorpay'
      });
    }
  }
}

export default new PaymentService();
