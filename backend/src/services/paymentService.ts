import razorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import paymentRepository from '../repositories/paymentRepository.js';
import Payment, { type IPayment, PaymentStatus } from '../models/Payment.js';
import gatewaySimulator from './gatewaySimulator.js';
import { sleep, exponentialBackoff } from '../utils/common.js';
import circuitBreaker from '../utils/CircuitBreaker.js';

class PaymentService {
  private readonly MAX_RETRIES = 3;

  async createOrder(amount: number, currency: string = 'INR', receipt?: string, idempotencyKey?: string) {
    logger.info(`Initiating order creation: amount=${amount}, currency=${currency}, key=${idempotencyKey}`);
    
    if (idempotencyKey) {
      const existing = await paymentRepository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        logger.info(`[Idempotency] Existing payment found for key: ${idempotencyKey}. Status: ${existing.status}`);
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
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    try {
      const order = await razorpayInstance.orders.create(orderOptions);
      
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

      logger.info(`[Lifecycle] Order created successfully: ${order.id}`);
      return order;
    } catch (error: any) {
      logger.error(`[Error] Order creation failed: ${error.message}`);
      throw new Error('Failed to initialize payment process');
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    logger.info(`Starting payment verification for Order: ${orderId}`);
    
    const payment = await paymentRepository.findByRazorpayOrderId(orderId);
    if (!payment) {
      logger.error(`[Error] Payment record not found for Order ID: ${orderId}`);
      throw new Error('Payment record not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      logger.info(`[Lifecycle] Payment ${orderId} already marked as SUCCESS`);
      return true;
    }

    const processingPayment = await paymentRepository.transitionStatus(
      payment._id.toString(),
      [PaymentStatus.PENDING],
      PaymentStatus.PROCESSING
    );

    if (!processingPayment) {
      logger.warn(`[Concurrency] Payment ${orderId} is already being processed or is in a terminal state (${payment.status})`);
      throw new Error('Payment is currently being processed');
    }

    logger.info(`[Lifecycle] Payment ${orderId} transitioned to PROCESSING`);

    try {
      const sign = orderId + "|" + paymentId;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(sign.toString())
        .digest("hex");

      if (signature !== expectedSign) {
        logger.error(`[Security] Invalid signature for order: ${orderId}`);
        await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.FAILED, {
          lastError: 'Invalid Signature'
        });
        return false;
      }

      let success = false;
      let attempt = 0;

      while (attempt < this.MAX_RETRIES && !success) {
        try {
          logger.info(`[Retry] Attempt ${attempt + 1} to process payment via External Gateway...`);
          
          // Using Circuit Breaker to wrap the external call
          await circuitBreaker.execute(() => gatewaySimulator.processPayment(payment.amount));
          
          success = true;
          logger.info(`[Retry] External Gateway success on attempt ${attempt + 1}`);
        } catch (error: any) {
          if (error.message === 'SERVICE_UNAVAILABLE_CIRCUIT_OPEN') {
            throw new Error('Payment service is temporarily down. Please try again later.');
          }

          attempt++;
          logger.error(`[Retry] External Gateway failure on attempt ${attempt}: ${error.message}`);
          
          if (attempt < this.MAX_RETRIES) {
            const delay = exponentialBackoff(attempt);
            logger.info(`[Retry] Scheduling retry ${attempt + 1} in ${delay}ms`);
            await sleep(delay);
          } else {
            logger.error(`[Retry] Max retries reached for payment ${orderId}`);
            throw error;
          }
        }
      }

      await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.SUCCESS, {
        razorpayPaymentId: paymentId
      });

      logger.info(`[Lifecycle] Payment ${orderId} successfully verified and processed`);
      return true;
    } catch (error: any) {
      logger.error(`[Lifecycle] Payment ${orderId} failed: ${error.message}`);
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
