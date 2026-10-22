import amqplib, { Channel, ChannelModel } from 'amqplib';
import pino from 'pino';

const logger = pino({ name: 'worker-rabbitmq' });

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
  const prefetchCount = Number(process.env.RABBITMQ_PREFETCH ?? 10);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn: ChannelModel = await amqplib.connect(url);
      const ch: Channel = await conn.createChannel();

      // Configure consumer prefetch for fair dispatch
      await ch.prefetch(prefetchCount);

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

      connection = conn;
      channel = ch;

      logger.info({ exchange, orderQueue, dlx, dlq, prefetch: prefetchCount }, 'Worker RabbitMQ connected and topology asserted');
      return ch;
    } catch (err) {
      logger.warn({ attempt, maxRetries: MAX_RETRIES, err }, 'Worker RabbitMQ connection failed, retrying...');
      if (attempt === MAX_RETRIES) {
        logger.error('Worker RabbitMQ connection exhausted all retries. Exiting.');
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

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
  logger.info('Worker RabbitMQ disconnected');
}
