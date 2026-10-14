import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../../src/config/db';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
}));

describe('config/db', () => {
  const originalUri = process.env.MONGO_URI;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
  });

  afterAll(() => {
    process.env.MONGO_URI = originalUri;
  });

  it('connects to MongoDB successfully on first attempt', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
  });

  it('throws an error if MONGO_URI is missing', async () => {
    delete process.env.MONGO_URI;

    await expect(connectDB()).rejects.toThrow('MONGO_URI environment variable is not set');
  });

  it('disconnects successfully', async () => {
    (mongoose.disconnect as jest.Mock).mockResolvedValue(undefined);

    await disconnectDB();

    expect(mongoose.disconnect).toHaveBeenCalledTimes(1);
  });
});
