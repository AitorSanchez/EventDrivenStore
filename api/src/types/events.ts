// ─────────────────────────────────────────────────────────────────────────────
// Shared event payload interfaces (DTOs) for RabbitMQ messages.
// Every message published to the broker must conform to one of these types.
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderCreatedEvent {
  eventId: string;         // UUID for idempotency checks in the Worker
  orderId: string;
  productId: string;
  quantity: number;
  customerEmail: string;
  reservedAt: string;      // ISO timestamp
}

export interface OrderCompletedEvent {
  eventId: string;
  orderId: string;
  productId: string;
  quantity: number;
  completedAt: string;
}

export interface OrderCancelledEvent {
  eventId: string;
  orderId: string;
  productId: string;
  quantity: number;        // Needed by worker to roll back reservation
  reason: string;
  cancelledAt: string;
}
