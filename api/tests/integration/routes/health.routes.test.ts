import request from 'supertest';
import { app } from '../../../src/index';

// Mock infrastructure so no live DB/RabbitMQ is needed
jest.mock('../../../src/config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../../src/config/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  getChannel: jest.fn(),
}));

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('api');
  });
});
