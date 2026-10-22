import { OrderCreatedHandler, PaymentProcessor, DefaultPaymentProcessor } from '../../src/handlers/orderCreated.handler';
import { OrderCreatedEvent } from '../../src/types/events';
import { Order } from '../../src/models/Order';
import { Product } from '../../src/models/Product';
import { ProcessedEvent } from '../../src/models/ProcessedEvent';

jest.mock('../../src/models/Order');
jest.mock('../../src/models/Product');
jest.mock('../../src/models/ProcessedEvent');

describe('DefaultPaymentProcessor', () => {
  const processor = new DefaultPaymentProcessor();

  it('approves payment by default', async () => {
    const result = await processor.processPayment({
      eventId: '11111111-1111-1111-1111-111111111111',
      orderId: 'order-1',
      productId: 'prod-1',
      quantity: 1,
      customerEmail: 'good@example.com',
      reservedAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('declines payment when customer email contains fail or decline', async () => {
    const result = await processor.processPayment({
      eventId: '11111111-1111-1111-1111-111111111111',
      orderId: 'order-2',
      productId: 'prod-1',
      quantity: 1,
      customerEmail: 'payment-failure@example.com',
      reservedAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
    expect(result.reason).toContain('Payment declined');
  });
});

describe('OrderCreatedHandler', () => {
  let mockPaymentProcessor: jest.Mocked<PaymentProcessor>;
  let handler: OrderCreatedHandler;

  const sampleEvent: OrderCreatedEvent = {
    eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    orderId: 'order-123',
    productId: 'product-123',
    quantity: 2,
    customerEmail: 'customer@example.com',
    reservedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPaymentProcessor = {
      processPayment: jest.fn(),
    };
    handler = new OrderCreatedHandler(mockPaymentProcessor);
  });

  it('finalizes order and clears reservation on payment success', async () => {
    (ProcessedEvent.findOne as jest.Mock).mockResolvedValue(null);
    (Order.findById as jest.Mock).mockResolvedValue({
      _id: 'order-123',
      status: 'pending',
    });
    mockPaymentProcessor.processPayment.mockResolvedValue({ success: true });

    const result = await handler.handle(sampleEvent);

    expect(result.status).toBe('completed');
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('product-123', {
      $inc: { reservedStock: -2 },
    });
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order-123', {
      $set: { status: 'completed' },
    });
    expect(ProcessedEvent.create).toHaveBeenCalledWith({
      eventId: sampleEvent.eventId,
      eventType: 'order.created',
    });
  });

  it('rolls back reservation and cancels order on payment failure (Saga compensation)', async () => {
    (ProcessedEvent.findOne as jest.Mock).mockResolvedValue(null);
    (Order.findById as jest.Mock).mockResolvedValue({
      _id: 'order-123',
      status: 'pending',
    });
    mockPaymentProcessor.processPayment.mockResolvedValue({
      success: false,
      reason: 'Insufficient funds',
    });

    const result = await handler.handle(sampleEvent);

    expect(result.status).toBe('cancelled');
    expect(result.reason).toBe('Insufficient funds');
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('product-123', {
      $inc: { reservedStock: -2, availableStock: 2 },
    });
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order-123', {
      $set: { status: 'cancelled' },
    });
    expect(ProcessedEvent.create).toHaveBeenCalledWith({
      eventId: sampleEvent.eventId,
      eventType: 'order.created',
    });
  });

  it('skips processing if eventId was already processed (Idempotency)', async () => {
    (ProcessedEvent.findOne as jest.Mock).mockResolvedValue({
      eventId: sampleEvent.eventId,
    });

    const result = await handler.handle(sampleEvent);

    expect(result.status).toBe('already_processed');
    expect(Order.findById).not.toHaveBeenCalled();
    expect(mockPaymentProcessor.processPayment).not.toHaveBeenCalled();
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('throws error when order is not found in database', async () => {
    (ProcessedEvent.findOne as jest.Mock).mockResolvedValue(null);
    (Order.findById as jest.Mock).mockResolvedValue(null);

    await expect(handler.handle(sampleEvent)).rejects.toThrow('Order order-123 not found');
    expect(mockPaymentProcessor.processPayment).not.toHaveBeenCalled();
  });

  it('skips processing if order is no longer pending', async () => {
    (ProcessedEvent.findOne as jest.Mock).mockResolvedValue(null);
    (Order.findById as jest.Mock).mockResolvedValue({
      _id: 'order-123',
      status: 'completed',
    });

    const result = await handler.handle(sampleEvent);

    expect(result.status).toBe('already_processed');
    expect(mockPaymentProcessor.processPayment).not.toHaveBeenCalled();
    expect(ProcessedEvent.create).toHaveBeenCalledWith({
      eventId: sampleEvent.eventId,
      eventType: 'order.created',
    });
  });
});
