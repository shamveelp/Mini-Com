import Payment, { type IPayment, PaymentStatus } from '../models/Payment.js';

class PaymentRepository {
  async create(paymentData: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async findByIdempotencyKey(key: string): Promise<IPayment | null> {
    return await Payment.findOne({ idempotencyKey: key });
  }

  async findByCustomId(customId: string): Promise<IPayment | null> {
    return await Payment.findOne({ customId });
  }

  async findByRazorpayOrderId(orderId: string): Promise<IPayment | null> {
    return await Payment.findOne({ razorpayOrderId: orderId });
  }

  async updateStatus(
    id: string, 
    status: PaymentStatus, 
    additionalData: Partial<IPayment> = {}
  ): Promise<IPayment | null> {
    return await Payment.findByIdAndUpdate(
      id,
      { $set: { status, ...additionalData } },
      { new: true }
    );
  }

  async transitionStatus(
    id: string,
    fromStatus: PaymentStatus[],
    toStatus: PaymentStatus,
    additionalData: Partial<IPayment> = {}
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { _id: id, status: { $in: fromStatus } },
      { $set: { status: toStatus, ...additionalData }, $inc: { attempts: 1 } },
      { new: true }
    );
  }

  async incrementAttempts(id: string, error: string): Promise<void> {
    await Payment.findByIdAndUpdate(id, {
      $inc: { attempts: 1 },
      $set: { lastError: error }
    });
  }
}

export default new PaymentRepository();
