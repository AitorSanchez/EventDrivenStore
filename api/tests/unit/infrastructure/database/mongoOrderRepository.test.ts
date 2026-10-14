import mongoose from 'mongoose';
import { MongoOrderRepository } from '../../../../src/infrastructure/database/mongoOrderRepository';
import { Order } from '../../../../src/models/Order';

jest.mock('../../../../src/models/Order');

describe('MongoOrderRepository', () => {
  const repo = new MongoOrderRepository();
  const mockOrderId = new mongoose.Types.ObjectId().toString();
  const mockProductId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a pending order document and returns domain data', async () => {
    const mockSavedDoc = {
      _id: mockOrderId,
      productId: mockProductId,
      quantity: 3,
      customerEmail: 'test@example.com',
      status: 'pending',
      eventId: 'evt-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Order as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSavedDoc),
    }));

    const result = await repo.createPending({
      productId: mockProductId,
      quantity: 3,
      customerEmail: 'test@example.com',
      eventId: 'evt-1',
    });

    expect(result.id).toBe(mockOrderId);
    expect(result.quantity).toBe(3);
    expect(result.status).toBe('pending');
  });

  it('finds populated order document by id', async () => {
    const mockPopulatedDoc = {
      _id: mockOrderId,
      productId: { name: 'Item', price: 50 },
      quantity: 2,
      customerEmail: 'test@example.com',
      status: 'pending',
      eventId: 'evt-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Order.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPopulatedDoc),
    });

    const result = await repo.findByIdPopulated(mockOrderId);

    expect(result).not.toBeNull();
    expect(result?.product).toEqual({ name: 'Item', price: 50 });
  });

  it('returns null when populated order is not found', async () => {
    (Order.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const result = await repo.findByIdPopulated('missing-id');
    expect(result).toBeNull();
  });
});
