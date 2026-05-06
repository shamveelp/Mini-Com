import logger from '../utils/logger.js';
import { sleep } from '../utils/common.js';

class ExternalGatewaySimulator {
  async processPayment(amount: number) {
    // Simulate random delay (1-3 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await sleep(delay);

    const rand = Math.random();

    // 10% chance of timeout
    if (rand < 0.1) {
      logger.warn('External Gateway: Timeout simulated');
      throw new Error('GATEWAY_TIMEOUT');
    }

    // 20% chance of random failure
    if (rand < 0.3) {
      logger.error('External Gateway: Processing failure simulated');
      throw new Error('GATEWAY_PROCESSING_ERROR');
    }

    // 70% chance of success
    logger.info('External Gateway: Payment processed successfully');
    return {
      status: 'success',
      transactionId: `tx_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString()
    };
  }
}

export default new ExternalGatewaySimulator();
