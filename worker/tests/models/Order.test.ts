import mongoose from 'mongoose';
import { Order } from '../../src/models/Order';

describe('Order Model (Worker)', () => {
  const validProductId = new mongoose.Types.ObjectId();

  it('validates a valid order', () => {
    const order = new Order({
      productId: validProductId,
      quantity: 2,
      customerEmail: 'test@example.com',
      eventId: 'evt-123',
    });

    const err = order.validateSync();
    expect(err).toBeUndefined();
    expect(order.status).toBe('pending');
  });

  it('fails validation on missing required fields', () => {
    const order = new Order({});
    const err = order.validateSync();

    expect(err).toBeDefined();
    expect(err?.errors['productId']).toBeDefined();
    expect(err?.errors['quantity']).toBeDefined();
    expect(err?.errors['customerEmail']).toBeDefined();
    expect(err?.errors['eventId']).toBeDefined();
  });

  it('rejects invalid status', () => {
    const order = new Order({
      productId: validProductId,
      quantity: 1,
      customerEmail: 'test@example.com',
      eventId: 'evt-123',
      status: 'invalid' as any,
    });

    const err = order.validateSync();
    expect(err).toBeDefined();
    expect(err?.errors['status']).toBeDefined();
  });
});
