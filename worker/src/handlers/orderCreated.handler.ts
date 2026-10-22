import pino from 'pino';
import { OrderCreatedEvent } from '../types/events';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { ProcessedEvent } from '../models/ProcessedEvent';

const logger = pino({ name: 'order-created-handler' });

export interface PaymentProcessor {
  processPayment(event: OrderCreatedEvent): Promise<{ success: boolean; reason?: string }>;
}

export class DefaultPaymentProcessor implements PaymentProcessor {
  async processPayment(event: OrderCreatedEvent): Promise<{ success: boolean; reason?: string }> {
    // Deterministic simulation: emails containing 'fail' or 'decline' simulate payment failure
    if (event.customerEmail.includes('fail') || event.customerEmail.includes('decline')) {
      return { success: false, reason: 'Payment declined by issuer' };
    }
    return { success: true };
  }
}

export interface ProcessOrderResult {
  orderId: string;
  status: 'completed' | 'cancelled' | 'already_processed';
  reason?: string;
}

export class OrderCreatedHandler {
  constructor(private readonly paymentProcessor: PaymentProcessor = new DefaultPaymentProcessor()) {}

  async handle(event: OrderCreatedEvent): Promise<ProcessOrderResult> {
    const { eventId, orderId, productId, quantity } = event;
    logger.info({ eventId, orderId, productId, quantity }, 'Handling order.created event');

    // ── Idempotency Check ───────────────────────────────────────────────────
    const alreadyProcessed = await ProcessedEvent.findOne({ eventId });
    if (alreadyProcessed) {
      logger.info({ eventId, orderId }, 'Event already processed. Skipping duplicate.');
      return { orderId, status: 'already_processed' };
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== 'pending') {
      logger.warn({ orderId, status: order.status }, 'Order is no longer pending. Skipping.');
      await ProcessedEvent.create({ eventId, eventType: 'order.created' });
      return { orderId, status: 'already_processed' };
    }

    // ── Simulate Payment Processing ─────────────────────────────────────────
    const payment = await this.paymentProcessor.processPayment(event);

    if (payment.success) {
      // ── Success Path: Finalize Order ──────────────────────────────────────
      logger.info({ orderId }, 'Payment approved. Finalizing order.');

      // Clear the reserved stock (stock was already deducted from availableStock in API)
      await Product.findByIdAndUpdate(productId, {
        $inc: { reservedStock: -quantity },
      });

      // Mark order as completed
      await Order.findByIdAndUpdate(orderId, {
        $set: { status: 'completed' },
      });

      // Record processed event for idempotency
      await ProcessedEvent.create({ eventId, eventType: 'order.created' });

      logger.info({ orderId }, 'Order completed successfully');
      return { orderId, status: 'completed' };
    } else {
      // ── Failure Path: Saga Compensation (Rollback Reservation) ─────────────
      const reason = payment.reason ?? 'Payment processing failed';
      logger.warn({ orderId, reason }, 'Payment failed. Compensating reservation.');

      // Return reserved stock to available stock
      await Product.findByIdAndUpdate(productId, {
        $inc: {
          reservedStock: -quantity,
          availableStock: quantity,
        },
      });

      // Mark order as cancelled
      await Order.findByIdAndUpdate(orderId, {
        $set: { status: 'cancelled' },
      });

      // Record processed event for idempotency
      await ProcessedEvent.create({ eventId, eventType: 'order.created' });

      logger.info({ orderId, reason }, 'Order compensated and marked as cancelled');
      return { orderId, status: 'cancelled', reason };
    }
  }
}
