import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index';
import { Product } from '../src/models/Product';
import { Order } from '../src/models/Order';
import * as rabbitmq from '../src/config/rabbitmq';

// ── Mock infrastructure ───────────────────────────────────────────────────────
jest.mock('../src/config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../src/config/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  getChannel: jest.fn(),
}));
jest.mock('../src/models/Product');
jest.mock('../src/models/Order');

const productId = new mongoose.Types.ObjectId().toString();

const validOrderPayload = {
  productId,
  quantity: 2,
  customerEmail: 'buyer@example.com',
};

describe('Order Routes', () => {
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
      // findOneAndUpdate returns null → reservation failed
      (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      // findById returns a product so we know it exists
      (Product.findById as jest.Mock).mockResolvedValue({
        _id: productId,
        availableStock: 1,
      });

      const res = await request(app)
        .post('/orders')
        .send({ ...validOrderPayload, quantity: 999 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INSUFFICIENT_STOCK');
      // No event should be published when stock check fails
      expect(rabbitmq.publishEvent).not.toHaveBeenCalled();
    });

    it('returns 404 when product does not exist', async () => {
      (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      (Product.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/orders').send(validOrderPayload);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('returns 202 and publishes an event on successful reservation', async () => {
      const reservedProduct = { _id: productId, availableStock: 98, reservedStock: 2 };
      (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(reservedProduct);

      const savedOrder = {
        _id: new mongoose.Types.ObjectId().toString(),
        status: 'pending',
        eventId: 'test-event-id',
      };
      (Order.prototype.save as jest.Mock).mockResolvedValue(savedOrder);

      const res = await request(app).post('/orders').send(validOrderPayload);

      expect(res.status).toBe(202);
      expect(res.body.status).toBe('pending');
      expect(rabbitmq.publishEvent).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          productId,
          quantity: validOrderPayload.quantity,
          customerEmail: validOrderPayload.customerEmail,
        })
      );
    });
  });

  describe('GET /orders/:id', () => {
    it('returns 404 when order does not exist', async () => {
      (Order.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      const res = await request(app).get(`/orders/${new mongoose.Types.ObjectId()}`);
      expect(res.status).toBe(404);
    });
  });
});
