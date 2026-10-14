import { CreateOrderHandler } from '../../../../src/application/commands/createOrder.handler';
import { CreateOrderCommand } from '../../../../src/application/commands/createOrder.command';
import { IProductRepository } from '../../../../src/ports/productRepository.port';
import { IOrderRepository } from '../../../../src/ports/orderRepository.port';
import { IEventPublisher } from '../../../../src/ports/eventPublisher.port';
import { NotFoundError, InsufficientStockError } from '../../../../src/domain/errors';

describe('CreateOrderHandler', () => {
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let mockOrderRepo: jest.Mocked<IOrderRepository>;
  let mockPublisher: jest.Mocked<IEventPublisher>;
  let handler: CreateOrderHandler;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      reserveStock: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    mockOrderRepo = {
      createPending: jest.fn(),
      findByIdPopulated: jest.fn(),
    };
    mockPublisher = {
      publish: jest.fn(),
    };
    handler = new CreateOrderHandler(mockProductRepo, mockOrderRepo, mockPublisher);
  });

  const command = new CreateOrderCommand('prod-123', 2, 'customer@example.com');

  it('reserves stock, creates pending order, and publishes event on success', async () => {
    mockProductRepo.reserveStock.mockResolvedValue(true);
    const mockOrder = {
      id: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      customerEmail: 'customer@example.com',
      status: 'pending' as const,
      eventId: 'evt-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOrderRepo.createPending.mockResolvedValue(mockOrder);

    const result = await handler.execute(command);

    expect(mockProductRepo.reserveStock).toHaveBeenCalledWith('prod-123', 2);
    expect(mockOrderRepo.createPending).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-123',
        quantity: 2,
        customerEmail: 'customer@example.com',
      })
    );
    expect(mockPublisher.publish).toHaveBeenCalledWith(
      'order.created',
      expect.objectContaining({
        orderId: 'order-123',
        productId: 'prod-123',
        quantity: 2,
        customerEmail: 'customer@example.com',
      })
    );
    expect(result.order).toEqual(mockOrder);
    expect(typeof result.eventId).toBe('string');
  });

  it('throws NotFoundError when reservation fails and product does not exist', async () => {
    mockProductRepo.reserveStock.mockResolvedValue(false);
    mockProductRepo.findById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    expect(mockProductRepo.findById).toHaveBeenCalledWith('prod-123');
    expect(mockOrderRepo.createPending).not.toHaveBeenCalled();
    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });

  it('throws InsufficientStockError when reservation fails and product has insufficient stock', async () => {
    mockProductRepo.reserveStock.mockResolvedValue(false);
    mockProductRepo.findById.mockResolvedValue({
      id: 'prod-123',
      name: 'Widget',
      price: 10,
      availableStock: 1,
      reservedStock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(handler.execute(command)).rejects.toThrow(InsufficientStockError);
    expect(mockOrderRepo.createPending).not.toHaveBeenCalled();
    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });
});
