import { UpdateProductHandler } from '../../../../src/application/commands/updateProduct.handler';
import { UpdateProductCommand } from '../../../../src/application/commands/updateProduct.command';
import { IProductRepository, ProductData } from '../../../../src/ports/productRepository.port';
import { NotFoundError } from '../../../../src/domain/errors';

describe('UpdateProductHandler', () => {
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let handler: UpdateProductHandler;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      reserveStock: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    handler = new UpdateProductHandler(mockProductRepo);
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

  it('updates product fields through repository port', async () => {
    const updatedProduct = { ...sampleProduct, price: 89.99 };
    mockProductRepo.update.mockResolvedValue(updatedProduct);
    const command = new UpdateProductCommand('prod-123', 'Keyboard V2', 'New description', 89.99, 45);

    const result = await handler.execute(command);

    expect(mockProductRepo.update).toHaveBeenCalledWith('prod-123', {
      name: 'Keyboard V2',
      description: 'New description',
      price: 89.99,
      availableStock: 45,
    });
    expect(result).toEqual(updatedProduct);
  });

  it('throws NotFoundError when product does not exist on update', async () => {
    mockProductRepo.update.mockResolvedValue(null);
    const command = new UpdateProductCommand('nonexistent', 'Name');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
  });
});
