import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino({ name: 'db' });

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri);
      logger.info({ uri }, 'MongoDB connected successfully');
      return;
    } catch (err) {
      logger.warn({ attempt, maxRetries: MAX_RETRIES, err }, 'MongoDB connection failed, retrying...');
      if (attempt === MAX_RETRIES) {
        logger.error('MongoDB connection exhausted all retries. Exiting.');
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
