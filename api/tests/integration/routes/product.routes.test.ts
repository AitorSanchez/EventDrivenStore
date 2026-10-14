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

const mockProduct = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Widget',
  price: 9.99,
  availableStock: 100,
  reservedStock: 0,
};

describe('Product Routes Integration', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /products', () => {
    it('returns an array of products', async () => {
      mockQueryExecute.mockResolvedValue([mockProduct]);
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('Widget');
    });
  });

  describe('GET /products/:id', () => {
    it('returns 404 when product does not exist', async () => {
      mockQueryExecute.mockResolvedValue(null);
      const res = await request(app).get(`/products/${mockProduct.id}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('returns the product when found', async () => {
      mockQueryExecute.mockResolvedValue(mockProduct);
      const res = await request(app).get(`/products/${mockProduct.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Widget');
    });
  });

  describe('POST /products', () => {
    it('returns 400 on invalid payload (missing price)', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Bad Product', availableStock: 10 });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('creates and returns a product with status 201', async () => {
      mockCommandExecute.mockResolvedValue(mockProduct);
      const res = await request(app).post('/products').send({
        name: 'Widget',
        price: 9.99,
        availableStock: 100,
      });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Widget');
    });
  });

  describe('PUT /products/:id', () => {
    it('returns 400 when empty payload is provided', async () => {
      const res = await request(app)
        .put(`/products/${mockProduct.id}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 when product to update does not exist', async () => {
      const { NotFoundError } = await import('../../../src/domain/errors');
      mockCommandExecute.mockRejectedValue(new NotFoundError('Product', mockProduct.id));

      const res = await request(app)
        .put(`/products/${mockProduct.id}`)
        .send({ price: 19.99 });
      expect(res.status).toBe(404);
    });

    it('returns the updated product', async () => {
      mockCommandExecute.mockResolvedValue({
        ...mockProduct,
        price: 19.99,
      });
      const res = await request(app)
        .put(`/products/${mockProduct.id}`)
        .send({ price: 19.99 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(19.99);
    });
  });
});
