import logger from './logger.js';

enum CircuitState {
  CLOSED, // Normal operation
  OPEN,   // Fast failing
  HALF_OPEN // Testing if service is back
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly threshold: number = 3; // 3 failures to open
  private readonly resetTimeout: number = 30000; // 30 seconds

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        logger.info('[CircuitBreaker] Transitioned to HALF_OPEN');
      } else {
        logger.warn('[CircuitBreaker] Circuit is OPEN. Fast failing request.');
        throw new Error('SERVICE_UNAVAILABLE_CIRCUIT_OPEN');
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      logger.info('[CircuitBreaker] Transitioned to CLOSED');
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      logger.error(`[CircuitBreaker] Threshold reached (${this.failureCount}). Transitioned to OPEN`);
    }
  }
}

export default new CircuitBreaker();
