import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/index';

// ── Mock commandBus and queryBus ──────────────────────────────────────────────
const mockCommandExecute = jest.fn();
const mockQueryExecute = jest.fn();

jest.mock('../../../src/container', () => ({
  commandBus: { execute: (...args: unknown[]) => mockCommandExecute(...args) },
  queryBus: { execute: (...args: unknown[]) => mockQueryExecute(...args) },
}));

// Mock infrastructure so no live DB/RabbitMQ is needed
jest.mock('../../../src/config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../../src/config/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  getChannel: jest.fn(),
}));

const productId = new mongoose.Types.ObjectId().toString();
const orderId = new mongoose.Types.ObjectId().toString();

const validOrderPayload = {
  productId,
  quantity: 2,
  customerEmail: 'buyer@example.com',
};

describe('Order Routes Integration', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /orders', () => {
    it('returns 400 on invalid payload (missing customerEmail)', async () => {
      const res = await request(app)
        .post('/orders')
        .send({ productId, quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when stock is insufficient', async () => {
      const { InsufficientStockError } = await import('../../../src/domain/errors');
      mockCommandExecute.mockRejectedValue(
        new InsufficientStockError(999, 1),
      );

      const res = await request(app)
        .post('/orders')
        .send({ ...validOrderPayload, quantity: 999 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INSUFFICIENT_STOCK');
    });

    it('returns 404 when product is not found', async () => {
      const { NotFoundError } = await import('../../../src/domain/errors');
      mockCommandExecute.mockRejectedValue(
        new NotFoundError('Product', productId),
      );

      const res = await request(app)
        .post('/orders')
        .send(validOrderPayload);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('returns 202 and the pending order when stock is reserved', async () => {
      const mockResult = {
        order: {
          id: orderId,
          productId,
          quantity: 2,
          customerEmail: 'buyer@example.com',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        eventId: 'test-event-uuid',
      };
      mockCommandExecute.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/orders')
        .send(validOrderPayload);

      expect(res.status).toBe(202);
      expect(res.body.message).toContain('Order accepted');
      expect(res.body.orderId).toBe(orderId);
      expect(res.body.status).toBe('pending');
      expect(res.body.eventId).toBe('test-event-uuid');
    });
  });

  describe('GET /orders/:id', () => {
    it('returns 404 when order does not exist', async () => {
      mockQueryExecute.mockResolvedValue(null);

      const res = await request(app).get(`/orders/${orderId}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('ORDER_NOT_FOUND');
    });

    it('returns 200 and the order when found', async () => {
      const mockOrder = {
        id: orderId,
        productId,
        quantity: 2,
        customerEmail: 'buyer@example.com',
        status: 'pending',
        eventId: 'test-event-uuid',
        createdAt: new Date().toISOString(),
        product: { name: 'Widget', price: 9.99 },
      };
      mockQueryExecute.mockResolvedValue(mockOrder);

      const res = await request(app).get(`/orders/${orderId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(orderId);
      expect(res.body.product.name).toBe('Widget');
    });
  });
});
