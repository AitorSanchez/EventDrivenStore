import { randomUUID } from 'crypto';
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { CreateOrderDto } from '../types/schemas';
import { OrderCreatedEvent } from '../types/events';
import { publishEvent } from '../config/rabbitmq';

export interface OrderResult {
  order: IOrder;
  eventId: string;
}

/**
 * Early Reservation Pattern:
 * 1. Atomically decrement availableStock + increment reservedStock in one DB op.
 * 2. If stock is insufficient, throw immediately (HTTP 400 — no event published).
 * 3. Create the Order document in 'pending' status.
 * 4. Publish 'order.created' event to RabbitMQ.
 * 5. Return 202 to caller — Worker will finalise or compensate asynchronously.
 */
export async function createOrder(dto: CreateOrderDto): Promise<OrderResult> {
  // ── Step 1: Atomic stock reservation ──────────────────────────────────────
  const reservedProduct = await Product.findOneAndUpdate(
    {
      _id: dto.productId,
      availableStock: { $gte: dto.quantity }, // Condition: enough stock
    },
    {
      $inc: {
        availableStock: -dto.quantity,
        reservedStock: dto.quantity,
      },
    },
    { new: true }
  );

  // ── Step 2: Reject immediately if reservation failed ───────────────────────
  if (!reservedProduct) {
    const product = await Product.findById(dto.productId);
    if (!product) {
      const err = new Error(`Product not found: ${dto.productId}`);
      (err as NodeJS.ErrnoException & { statusCode: number; code: string }).statusCode = 404;
      (err as NodeJS.ErrnoException & { statusCode: number; code: string }).code = 'PRODUCT_NOT_FOUND';
      throw err;
    }
    const err = new Error(
      `Insufficient stock. Requested: ${dto.quantity}, Available: ${product.availableStock}`
    );
    (err as NodeJS.ErrnoException & { statusCode: number; code: string }).statusCode = 400;
    (err as NodeJS.ErrnoException & { statusCode: number; code: string }).code = 'INSUFFICIENT_STOCK';
    throw err;
  }

  // ── Step 3: Create Order in 'pending' status ───────────────────────────────
  const eventId = randomUUID();
  const order = await new Order({
    productId: dto.productId,
    quantity: dto.quantity,
    customerEmail: dto.customerEmail,
    status: 'pending',
    eventId,
  }).save();

  // ── Step 4: Publish event to RabbitMQ ─────────────────────────────────────
  const event: OrderCreatedEvent = {
    eventId,
    orderId: (order._id as unknown as string).toString(),
    productId: dto.productId,
    quantity: dto.quantity,
    customerEmail: dto.customerEmail,
    reservedAt: new Date().toISOString(),
  };
  publishEvent('order.created', event);

  return { order, eventId };
}

export async function getOrderById(id: string): Promise<IOrder | null> {
  return Order.findById(id).populate('productId', 'name price');
}
