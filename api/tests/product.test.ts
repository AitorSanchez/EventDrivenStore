import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index';
import { Product } from '../src/models/Product';

// ── Mock infrastructure so no live DB/RabbitMQ is needed ─────────────────────
jest.mock('../src/config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../src/config/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  getChannel: jest.fn(),
}));
jest.mock('../src/models/Product');
jest.mock('../src/models/Order');

const mockProduct = {
  _id: new mongoose.Types.ObjectId().toString(),
  name: 'Widget',
  price: 9.99,
  availableStock: 100,
  reservedStock: 0,
};

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('api');
  });
});

describe('Product Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /products', () => {
    it('returns an array of products', async () => {
      (Product.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockProduct]),
      });
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('returns 404 when product does not exist', async () => {
      (Product.findById as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get(`/products/${mockProduct._id}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('returns the product when found', async () => {
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      const res = await request(app).get(`/products/${mockProduct._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Widget');
    });
  });

  describe('POST /products', () => {
    it('returns 400 on invalid payload (missing price)', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Bad Product', availableStock: 10 }); // missing price
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('creates and returns a product with status 201', async () => {
      (Product.prototype.save as jest.Mock).mockResolvedValue(mockProduct);
      const res = await request(app).post('/products').send({
        name: 'Widget',
        price: 9.99,
        availableStock: 100,
      });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /products/:id', () => {
    it('returns 400 when empty payload is provided', async () => {
      const res = await request(app)
        .put(`/products/${mockProduct._id}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 when product to update does not exist', async () => {
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .put(`/products/${mockProduct._id}`)
        .send({ price: 19.99 });
      expect(res.status).toBe(404);
    });

    it('returns the updated product', async () => {
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockProduct,
        price: 19.99,
      });
      const res = await request(app)
        .put(`/products/${mockProduct._id}`)
        .send({ price: 19.99 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(19.99);
    });
  });
});
