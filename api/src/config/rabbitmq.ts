import amqplib, { Channel, ChannelModel } from 'amqplib';
import pino from 'pino';

const logger = pino({ name: 'rabbitmq' });

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectRabbitMQ(): Promise<Channel> {
  const url = process.env.RABBITMQ_URL;
  if (!url) throw new Error('RABBITMQ_URL environment variable is not set');

  const exchange = process.env.RABBITMQ_EXCHANGE ?? 'store.events';
  const orderQueue = process.env.RABBITMQ_QUEUE_ORDERS ?? 'orders';
  const dlx = process.env.RABBITMQ_DLX ?? 'store.dlx';
  const dlq = `${orderQueue}.dead`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // amqplib v0.10+: connect() returns ChannelModel (not Connection)
      const conn: ChannelModel = await amqplib.connect(url);
      const ch: Channel = await conn.createChannel();

      // ── Assert Dead-Letter Exchange ─────────────────────────────────────────
      await ch.assertExchange(dlx, 'topic', { durable: true });

      // ── Assert Dead-Letter Queue ────────────────────────────────────────────
      await ch.assertQueue(dlq, { durable: true });
      await ch.bindQueue(dlq, dlx, '#');

      // ── Assert Main Exchange ────────────────────────────────────────────────
      await ch.assertExchange(exchange, 'topic', { durable: true });

      // ── Assert Order Queue (backed by DLX) ─────────────────────────────────
      await ch.assertQueue(orderQueue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': dlx,
          'x-dead-letter-routing-key': `${orderQueue}.dead`,
        },
      });
      await ch.bindQueue(orderQueue, exchange, 'order.*');

      // Assign to module-level refs after full setup succeeds
      connection = conn;
      channel = ch;

      logger.info({ exchange, orderQueue }, 'RabbitMQ connected and topology asserted');
      return ch;
    } catch (err) {
      logger.warn({ attempt, maxRetries: MAX_RETRIES, err }, 'RabbitMQ connection failed, retrying...');
      if (attempt === MAX_RETRIES) {
        logger.error('RabbitMQ connection exhausted all retries. Exiting.');
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // TypeScript requires a guaranteed return — this path is never reached.
  throw new Error('RabbitMQ connection failed');
}

export function getChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ() first.');
  return channel;
}

export async function disconnectRabbitMQ(): Promise<void> {
  await channel?.close();
  await connection?.close();
  channel = null;
  connection = null;
  logger.info('RabbitMQ disconnected');
}

export function publishEvent(routingKey: string, payload: object): void {
  const ch = getChannel();
  const exchange = process.env.RABBITMQ_EXCHANGE ?? 'store.events';
  const content = Buffer.from(JSON.stringify(payload));
  ch.publish(exchange, routingKey, content, {
    persistent: true,          // Message survives broker restart
    contentType: 'application/json',
  });
  logger.info({ routingKey, payload }, 'Event published');
}
