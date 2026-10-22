// ─────────────────────────────────────────────────────────────────────────────
// Event DTOs and Zod Validation Schemas for Worker Service
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

export const OrderCreatedEventSchema = z.object({
  eventId: z.string().uuid(),
  orderId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  customerEmail: z.string().email(),
  reservedAt: z.string().datetime(),
});

export type OrderCreatedEvent = z.infer<typeof OrderCreatedEventSchema>;

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
  quantity: number;
  reason: string;
  cancelledAt: string;
}
