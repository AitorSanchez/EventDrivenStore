// ─────────────────────────────────────────────────────────────────────────────
// Port: IEventPublisher
// Hexagonal "driven" port — defines the contract for publishing domain events.
// No RabbitMQ / amqplib imports allowed here.
// ─────────────────────────────────────────────────────────────────────────────

export interface IEventPublisher {
  /**
   * Publish a domain event to the messaging infrastructure.
   * @param routingKey - Topic routing key (e.g. 'order.created')
   * @param payload    - Typed event payload (serialised to JSON by the adapter)
   */
  publish(routingKey: string, payload: Record<string, unknown>): void;
}
