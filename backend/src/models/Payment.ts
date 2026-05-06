import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface IPayment extends Document {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotencyKey: string;
  attempts: number;
  lastError?: string;
  metadata?: any;
}

const PaymentSchema: Schema = new Schema({
  orderId: { type: String, required: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: Object.values(PaymentStatus), 
    default: PaymentStatus.PENDING 
  },
  idempotencyKey: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  lastError: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Index for idempotency lookups
PaymentSchema.index({ idempotencyKey: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
