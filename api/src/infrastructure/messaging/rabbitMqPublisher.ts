// ─────────────────────────────────────────────────────────────────────────────
// Adapter: RabbitMqPublisher
// amqplib implementation of IEventPublisher port.
// Wraps the low-level publishEvent function behind a clean interface.
// ─────────────────────────────────────────────────────────────────────────────

import { IEventPublisher } from '../../ports/eventPublisher.port';
import { publishEvent } from '../../config/rabbitmq';

export class RabbitMqPublisher implements IEventPublisher {
  publish(routingKey: string, payload: Record<string, unknown>): void {
    publishEvent(routingKey, payload);
  }
}
