import { GetProductByIdHandler } from '../../../../src/application/queries/getProductById.handler';
import { GetProductByIdQuery } from '../../../../src/application/queries/getProductById.query';
import { IProductRepository, ProductData } from '../../../../src/ports/productRepository.port';

describe('GetProductByIdHandler', () => {
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let handler: GetProductByIdHandler;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      reserveStock: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    handler = new GetProductByIdHandler(mockProductRepo);
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

  it('returns product by id when found', async () => {
    mockProductRepo.findById.mockResolvedValue(sampleProduct);

    const result = await handler.execute(new GetProductByIdQuery('prod-123'));

    expect(mockProductRepo.findById).toHaveBeenCalledWith('prod-123');
    expect(result).toEqual(sampleProduct);
  });

  it('returns null when product is not found', async () => {
    mockProductRepo.findById.mockResolvedValue(null);

    const result = await handler.execute(new GetProductByIdQuery('prod-missing'));

    expect(mockProductRepo.findById).toHaveBeenCalledWith('prod-missing');
    expect(result).toBeNull();
  });
});
