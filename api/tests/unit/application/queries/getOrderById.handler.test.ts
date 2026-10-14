import { GetOrderByIdHandler } from '../../../../src/application/queries/getOrderById.handler';
import { GetOrderByIdQuery } from '../../../../src/application/queries/getOrderById.query';
import { IOrderRepository, OrderViewData } from '../../../../src/ports/orderRepository.port';

describe('GetOrderByIdHandler', () => {
  let mockOrderRepo: jest.Mocked<IOrderRepository>;
  let handler: GetOrderByIdHandler;

  beforeEach(() => {
    mockOrderRepo = {
      createPending: jest.fn(),
      findByIdPopulated: jest.fn(),
    };
    handler = new GetOrderByIdHandler(mockOrderRepo);
  });

  it('delegates to orderRepo.findByIdPopulated and returns the order view', async () => {
    const mockView: OrderViewData = {
      id: 'order-1',
      productId: 'prod-1',
      product: {
        name: 'Item',
        price: 25,
      },
      quantity: 1,
      customerEmail: 'user@example.com',
      status: 'pending',
      eventId: 'evt-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOrderRepo.findByIdPopulated.mockResolvedValue(mockView);

    const result = await handler.execute(new GetOrderByIdQuery('order-1'));

    expect(mockOrderRepo.findByIdPopulated).toHaveBeenCalledWith('order-1');
    expect(result).toEqual(mockView);
  });

  it('returns null when order is not found', async () => {
    mockOrderRepo.findByIdPopulated.mockResolvedValue(null);

    const result = await handler.execute(new GetOrderByIdQuery('missing-order'));

    expect(mockOrderRepo.findByIdPopulated).toHaveBeenCalledWith('missing-order');
    expect(result).toBeNull();
  });
});
