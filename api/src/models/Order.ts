import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface IOrder extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  customerEmail: string;
  status: OrderStatus;
  eventId: string;   // Stored for idempotency in the Worker
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    customerEmail: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    eventId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
