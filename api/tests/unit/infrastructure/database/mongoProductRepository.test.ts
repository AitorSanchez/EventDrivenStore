import mongoose from 'mongoose';
import { MongoProductRepository } from '../../../../src/infrastructure/database/mongoProductRepository';
import { Product } from '../../../../src/models/Product';

jest.mock('../../../../src/models/Product');

describe('MongoProductRepository', () => {
  const repo = new MongoProductRepository();
  const mockId = new mongoose.Types.ObjectId().toString();

  const mockProductDoc = {
    _id: mockId,
    name: 'Widget',
    description: 'Useful widget',
    price: 15.5,
    availableStock: 20,
    reservedStock: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('finds product by id', async () => {
    (Product.findById as jest.Mock).mockResolvedValue(mockProductDoc);

    const result = await repo.findById(mockId);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(mockId);
    expect(result?.name).toBe('Widget');
  });

  it('returns null if product id is not found', async () => {
    (Product.findById as jest.Mock).mockResolvedValue(null);

    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('finds all products sorted by createdAt desc', async () => {
    (Product.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockProductDoc]),
    });

    const result = await repo.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Widget');
  });

  it('reserves stock successfully with atomic findOneAndUpdate', async () => {
    (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(mockProductDoc);

    const success = await repo.reserveStock(mockId, 5);
    expect(success).toBe(true);
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockId, availableStock: { $gte: 5 } },
      { $inc: { availableStock: -5, reservedStock: 5 } },
      { new: true }
    );
  });

  it('returns false when reserveStock fails (insufficient stock or not found)', async () => {
    (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    const success = await repo.reserveStock(mockId, 999);
    expect(success).toBe(false);
  });

  it('creates product through Mongoose model save', async () => {
    (Product as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockProductDoc),
    }));

    const result = await repo.create({
      name: 'Widget',
      description: 'Useful widget',
      price: 15.5,
      availableStock: 20,
    });

    expect(result.name).toBe('Widget');
  });

  it('updates product and returns updated domain entity', async () => {
    (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...mockProductDoc,
      price: 25.0,
    });

    const result = await repo.update(mockId, { price: 25.0 });
    expect(result).not.toBeNull();
    expect(result?.price).toBe(25.0);
  });

  it('returns null when updating non-existent product', async () => {
    (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const result = await repo.update('missing', { price: 25.0 });
    expect(result).toBeNull();
  });
});
