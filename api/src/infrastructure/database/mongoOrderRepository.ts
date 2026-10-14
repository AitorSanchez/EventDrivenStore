// ─────────────────────────────────────────────────────────────────────────────
// Adapter: MongoOrderRepository
// Mongoose implementation of IOrderRepository port.
// All low-level MongoDB operations for orders are encapsulated here.
// ─────────────────────────────────────────────────────────────────────────────

import { Order } from '../../models/Order';
import {
  IOrderRepository,
  OrderData,
  OrderViewData,
  CreatePendingOrderData,
} from '../../ports/orderRepository.port';

export class MongoOrderRepository implements IOrderRepository {
  async createPending(data: CreatePendingOrderData): Promise<OrderData> {
    const doc = await new Order({
      productId: data.productId,
      quantity: data.quantity,
      customerEmail: data.customerEmail,
      status: 'pending',
      eventId: data.eventId,
    }).save();

    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      quantity: doc.quantity,
      customerEmail: doc.customerEmail,
      status: doc.status,
      eventId: doc.eventId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByIdPopulated(id: string): Promise<OrderViewData | null> {
    const doc = await Order.findById(id).populate('productId', 'name price');
    if (!doc) return null;

    // After populate, productId is either a populated object or an ObjectId
    const populated = doc.productId as unknown as
      | { name: string; price: number }
      | undefined;

    return {
      id: doc._id.toString(),
      productId: doc._id.toString(),
      quantity: doc.quantity,
      customerEmail: doc.customerEmail,
      status: doc.status,
      eventId: doc.eventId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      product: populated && 'name' in populated
        ? { name: populated.name, price: populated.price }
        : undefined,
    };
  }
}
