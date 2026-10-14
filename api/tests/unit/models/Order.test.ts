import mongoose from 'mongoose';
import { Order } from '../../../src/models/Order';

describe('Order Model Schema Validation', () => {
  const validProductId = new mongoose.Types.ObjectId();

  it('validates a valid order', () => {
    const order = new Order({
      productId: validProductId,
      quantity: 2,
      customerEmail: 'customer@example.com',
      eventId: 'evt-12345',
    });

    const err = order.validateSync();
    expect(err).toBeUndefined();
    expect(order.status).toBe('pending');
    expect(order.quantity).toBe(2);
  });

  it('applies default status "pending"', () => {
    const order = new Order({
      productId: validProductId,
      quantity: 1,
      customerEmail: 'customer@example.com',
      eventId: 'evt-123',
    });

    expect(order.status).toBe('pending');
  });

  it('fails validation when required fields are missing', () => {
    const order = new Order({});
    const err = order.validateSync();

    expect(err).toBeDefined();
    expect(err?.errors['productId']).toBeDefined();
    expect(err?.errors['quantity']).toBeDefined();
    expect(err?.errors['customerEmail']).toBeDefined();
    expect(err?.errors['eventId']).toBeDefined();
  });

  it('fails validation when quantity is less than 1', () => {
    const order = new Order({
      productId: validProductId,
      quantity: 0,
      customerEmail: 'customer@example.com',
      eventId: 'evt-123',
    });

    const err = order.validateSync();
    expect(err).toBeDefined();
    expect(err?.errors['quantity']).toBeDefined();
  });

  it('fails validation when status is not a valid enum value', () => {
    const order = new Order({
      productId: validProductId,
      quantity: 1,
      customerEmail: 'customer@example.com',
      eventId: 'evt-123',
      status: 'shipped' as any,
    });

    const err = order.validateSync();
    expect(err).toBeDefined();
    expect(err?.errors['status']).toBeDefined();
  });

  it('allows valid status enum values: pending, completed, cancelled', () => {
    for (const status of ['pending', 'completed', 'cancelled'] as const) {
      const order = new Order({
        productId: validProductId,
        quantity: 1,
        customerEmail: 'customer@example.com',
        eventId: `evt-${status}`,
        status,
      });

      const err = order.validateSync();
      expect(err).toBeUndefined();
      expect(order.status).toBe(status);
    }
  });

  it('trims whitespace from customerEmail', () => {
    const order = new Order({
      productId: validProductId,
      quantity: 1,
      customerEmail: '   user@example.com   ',
      eventId: 'evt-trim',
    });

    expect(order.customerEmail).toBe('user@example.com');
  });
});
