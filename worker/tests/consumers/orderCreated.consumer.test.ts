import { Channel, ConsumeMessage } from 'amqplib';
import { OrderCreatedConsumer } from '../../src/consumers/orderCreated.consumer';
import { OrderCreatedHandler } from '../../src/handlers/orderCreated.handler';

describe('OrderCreatedConsumer', () => {
  let mockChannel: jest.Mocked<Channel>;
  let mockHandler: jest.Mocked<OrderCreatedHandler>;
  let consumer: OrderCreatedConsumer;

  const validPayload = {
    eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    orderId: 'order-123',
    productId: 'product-123',
    quantity: 2,
    customerEmail: 'customer@example.com',
    reservedAt: new Date().toISOString(),
  };

  const createMockMessage = (content: string): ConsumeMessage =>
    ({
      content: Buffer.from(content),
      fields: {} as any,
      properties: {} as any,
    } as ConsumeMessage);

  beforeEach(() => {
    mockChannel = {
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
    } as unknown as jest.Mocked<Channel>;

    mockHandler = {
      handle: jest.fn(),
    } as unknown as jest.Mocked<OrderCreatedHandler>;

    consumer = new OrderCreatedConsumer(mockChannel, mockHandler);
  });

  it('acks message when processing succeeds', async () => {
    const msg = createMockMessage(JSON.stringify(validPayload));
    mockHandler.handle.mockResolvedValue({
      orderId: 'order-123',
      status: 'completed',
    });

    await consumer.processMessage(msg);

    expect(mockHandler.handle).toHaveBeenCalledWith(validPayload);
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it('nacks message without requeue (DLQ) when JSON is invalid', async () => {
    const msg = createMockMessage('not-valid-json');

    await consumer.processMessage(msg);

    expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(mockChannel.ack).not.toHaveBeenCalled();
    expect(mockHandler.handle).not.toHaveBeenCalled();
  });

  it('nacks message without requeue (DLQ) when payload fails schema validation', async () => {
    const invalidPayload = { ...validPayload, eventId: 'not-a-uuid' };
    const msg = createMockMessage(JSON.stringify(invalidPayload));

    await consumer.processMessage(msg);

    expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(mockChannel.ack).not.toHaveBeenCalled();
    expect(mockHandler.handle).not.toHaveBeenCalled();
  });

  it('nacks message without requeue (DLQ) when handler throws', async () => {
    const msg = createMockMessage(JSON.stringify(validPayload));
    mockHandler.handle.mockRejectedValue(new Error('Database error'));

    await consumer.processMessage(msg);

    expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });

  it('registers consumer with manual ack on queue and processes messages from callback', async () => {
    let messageCallback: ((msg: ConsumeMessage | null) => Promise<void>) | undefined;
    mockChannel.consume.mockImplementation((_queue: string, cb: any) => {
      messageCallback = cb;
      return Promise.resolve({ consumerTag: 'test-tag' });
    });

    await consumer.start('orders');

    expect(mockChannel.consume).toHaveBeenCalledWith(
      'orders',
      expect.any(Function),
      { noAck: false }
    );

    // Test null message
    expect(messageCallback).toBeDefined();
    await messageCallback!(null);

    // Test valid message via callback
    const msg = createMockMessage(JSON.stringify(validPayload));
    mockHandler.handle.mockResolvedValue({
      orderId: 'order-123',
      status: 'completed',
    });
    await messageCallback!(msg);
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
});
