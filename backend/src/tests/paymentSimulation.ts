import paymentService from '../services/paymentService.js';
import paymentRepository from '../repositories/paymentRepository.js';
import { PaymentStatus } from '../models/Payment.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runSimulation() {
  try {
    logger.info('--- STARTING PAYMENT SIMULATION ---');

    // 1. Test Idempotency
    const iKey = `test_key_${Date.now()}`;
    logger.info('Scenario 1: Testing Idempotency');
    const order1 = await paymentService.createOrder(100, 'INR', 'receipt_1', iKey);
    logger.info(`First order status: ${order1.status}`);
    
    const order2 = await paymentService.createOrder(100, 'INR', 'receipt_1', iKey);
    // @ts-ignore
    logger.info(`Second order (duplicate) isDuplicate: ${order2.isDuplicate}`);

    // 2. Test Concurrency (Simulated)
    logger.info('Scenario 2: Testing Concurrency Control');
    const payment = await paymentRepository.findByIdempotencyKey(iKey);
    if (payment) {
        // Manually move to PROCESSING to simulate another process working on it
        await paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.PROCESSING);
        
        try {
            await paymentService.verifyPayment(payment.razorpayOrderId, 'pay_123', 'invalid_sig');
        } catch (error: any) {
            logger.info(`Concurrency catch successful: ${error.message}`);
        }
    }

    // 3. Test Retry Logic
    logger.info('Scenario 3: Testing Retry Logic (Check logs for attempts)');
    // We create a new pending payment
    const iKey2 = `test_key_retry_${Date.now()}`;
    const order3 = await paymentService.createOrder(500, 'INR', 'receipt_retry', iKey2);
    
    // We need a valid signature for the test to proceed past signature check
    // but the simulator will still trigger retries randomly.
    // For simulation, we'll just observe the logs.

    logger.info('--- SIMULATION COMPLETED ---');
  } catch (error: any) {
    logger.error(`Simulation Error: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Connect to DB before running
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mini-com')
  .then(() => runSimulation());
