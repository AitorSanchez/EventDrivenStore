import amqplib from 'amqplib';
import {
  connectRabbitMQ,
  getChannel,
  disconnectRabbitMQ,
} from '../../src/config/rabbitmq';

jest.mock('amqplib');

describe('config/rabbitmq (Worker)', () => {
  const originalUrl = process.env.RABBITMQ_URL;
  let mockChannel: any;
  let mockConn: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';

    mockChannel = {
      prefetch: jest.fn().mockResolvedValue({}),
      assertExchange: jest.fn().mockResolvedValue({}),
      assertQueue: jest.fn().mockResolvedValue({}),
      bindQueue: jest.fn().mockResolvedValue({}),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConn = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (amqplib.connect as jest.Mock).mockResolvedValue(mockConn);
  });

  afterAll(() => {
    process.env.RABBITMQ_URL = originalUrl;
  });

  it('throws error when RABBITMQ_URL is missing', async () => {
    delete process.env.RABBITMQ_URL;
    await expect(connectRabbitMQ()).rejects.toThrow('RABBITMQ_URL environment variable is not set');
  });

  it('connects, sets prefetch and topology, and returns channel', async () => {
    const ch = await connectRabbitMQ();

    expect(amqplib.connect).toHaveBeenCalledWith('amqp://guest:guest@localhost:5672');
    expect(mockChannel.prefetch).toHaveBeenCalledWith(10);
    expect(mockChannel.assertExchange).toHaveBeenCalledWith('store.dlx', 'topic', { durable: true });
    expect(mockChannel.assertExchange).toHaveBeenCalledWith('store.events', 'topic', { durable: true });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('orders.dead', { durable: true });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(
      'orders',
      expect.objectContaining({ durable: true })
    );
    expect(ch).toBe(mockChannel);
  });

  it('provides getChannel after connection is established', async () => {
    await connectRabbitMQ();
    expect(getChannel()).toBe(mockChannel);
  });

  it('disconnects cleanly', async () => {
    await connectRabbitMQ();
    await disconnectRabbitMQ();

    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConn.close).toHaveBeenCalled();
    expect(() => getChannel()).toThrow('RabbitMQ channel not initialized');
  });
});
