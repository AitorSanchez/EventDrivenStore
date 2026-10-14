import { CreateProductHandler } from '../../../../src/application/commands/createProduct.handler';
import { CreateProductCommand } from '../../../../src/application/commands/createProduct.command';
import { IProductRepository, ProductData } from '../../../../src/ports/productRepository.port';

describe('CreateProductHandler', () => {
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let handler: CreateProductHandler;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      reserveStock: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    handler = new CreateProductHandler(mockProductRepo);
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

  it('creates product through repository port', async () => {
    mockProductRepo.create.mockResolvedValue(sampleProduct);
    const command = new CreateProductCommand('Keyboard', 99.99, 50, 'Mechanical Keyboard');

    const result = await handler.execute(command);

    expect(mockProductRepo.create).toHaveBeenCalledWith({
      name: 'Keyboard',
      description: 'Mechanical Keyboard',
      price: 99.99,
      availableStock: 50,
    });
    expect(result).toEqual(sampleProduct);
  });
});
