// ─────────────────────────────────────────────────────────────────────────────
// Command Handler: CreateOrderHandler
// Orchestrates the Early Reservation Pattern using injected ports.
// Pure business logic — no Mongoose, no RabbitMQ imports.
// ─────────────────────────────────────────────────────────────────────────────

import { randomUUID } from 'crypto';
import { CreateOrderCommand } from './createOrder.command';
import { IProductRepository } from '../../ports/productRepository.port';
import { IOrderRepository, OrderData } from '../../ports/orderRepository.port';
import { IEventPublisher } from '../../ports/eventPublisher.port';
import { NotFoundError, InsufficientStockError } from '../../domain/errors';
import { OrderCreatedEvent } from '../../types/events';
import { CommandHandler } from '../bus/commandBus';

export interface CreateOrderResult {
  order: OrderData;
  eventId: string;
}

export class CreateOrderHandler implements CommandHandler<CreateOrderCommand, CreateOrderResult> {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly orderRepo: IOrderRepository,
    private readonly publisher: IEventPublisher,
  ) {}

  /**
   * Early Reservation Pattern:
   * 1. Atomically reserve stock via the product repository port.
   * 2. If reservation fails, determine reason (missing product vs insufficient stock).
   * 3. Create the Order document in 'pending' status.
   * 4. Publish 'order.created' event via the event publisher port.
   * 5. Return the order and eventId — Worker will finalise or compensate async.
   */
  async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    // ── Step 1: Atomic stock reservation ──────────────────────────────────
    const reserved = await this.productRepo.reserveStock(
      command.productId,
      command.quantity,
    );

    // ── Step 2: Reject immediately if reservation failed ──────────────────
    if (!reserved) {
      const product = await this.productRepo.findById(command.productId);
      if (!product) {
        throw new NotFoundError('Product', command.productId);
      }
      throw new InsufficientStockError(command.quantity, product.availableStock);
    }

    // ── Step 3: Create Order in 'pending' status ──────────────────────────
    const eventId = randomUUID();
    const order = await this.orderRepo.createPending({
      productId: command.productId,
      quantity: command.quantity,
      customerEmail: command.customerEmail,
      eventId,
    });

    // ── Step 4: Publish event ─────────────────────────────────────────────
    const event: OrderCreatedEvent = {
      eventId,
      orderId: order.id,
      productId: command.productId,
      quantity: command.quantity,
      customerEmail: command.customerEmail,
      reservedAt: new Date().toISOString(),
    };
    this.publisher.publish('order.created', event as unknown as Record<string, unknown>);

    return { order, eventId };
  }
}
