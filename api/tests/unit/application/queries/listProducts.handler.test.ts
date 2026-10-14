import { ListProductsHandler } from '../../../../src/application/queries/listProducts.handler';
import { ListProductsQuery } from '../../../../src/application/queries/listProducts.query';
import { IProductRepository, ProductData } from '../../../../src/ports/productRepository.port';

describe('ListProductsHandler', () => {
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let handler: ListProductsHandler;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      reserveStock: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    handler = new ListProductsHandler(mockProductRepo);
  });

  const sampleProduct: ProductData = {
    id: 'prod-123',
    name: 'Keyboard',
    description: 'Mechanical Keyboard',
    price: 99.99,
    availableStock: 50,
    reservedStock: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('returns all products from repository port', async () => {
    mockProductRepo.findAll.mockResolvedValue([sampleProduct]);

    const result = await handler.execute(new ListProductsQuery());

    expect(mockProductRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([sampleProduct]);
  });
});
