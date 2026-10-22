import pino from 'pino';
import { connectDB, disconnectDB } from './config/db';
import { connectRabbitMQ, disconnectRabbitMQ } from './config/rabbitmq';
import { OrderCreatedConsumer } from './consumers/orderCreated.consumer';

const logger = pino({ name: 'worker' });

// ── Validate required env vars at startup ─────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'RABBITMQ_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.fatal({ key }, `Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting Worker service...');

    // Connect to MongoDB
    await connectDB();

    // Connect to RabbitMQ and assert topology (DLX, DLQ, exchange, queues)
    const channel = await connectRabbitMQ();

    // Register event consumers
    const orderConsumer = new OrderCreatedConsumer(channel);
    await orderConsumer.start();

    logger.info('Worker service is running and listening for events');
  } catch (err) {
    logger.fatal({ err }, 'Fatal error during worker bootstrap');
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutting down worker service gracefully...');
  try {
    await disconnectRabbitMQ();
    await disconnectDB();
    logger.info('Worker service stopped cleanly');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

bootstrap();
