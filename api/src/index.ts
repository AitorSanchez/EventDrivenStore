import 'express-async-errors';
import express from 'express';
import pinoHttp from 'pino-http';
import pino from 'pino';

import { connectDB } from './config/db';
import { connectRabbitMQ } from './config/rabbitmq';
import { errorHandler } from './middleware/errorHandler';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';

const logger = pino({ name: 'api' });

// ── Validate required env vars at startup ─────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'RABBITMQ_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.fatal({ key }, `Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = Number(process.env.PORT ?? 3000);

// ── Create Express app ────────────────────────────────────────────────────────
export const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// ── Global error handler (must be last middleware) ────────────────────────────
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDB();
  await connectRabbitMQ();

  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'API service started');
  });
}

// Only boot when this file is the entrypoint (not when imported in tests)
if (require.main === module) {
  bootstrap().catch((err) => {
    logger.fatal({ err }, 'Failed to start API service');
    process.exit(1);
  });
}
