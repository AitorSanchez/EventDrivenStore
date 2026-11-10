import { getEnv } from '../env';

describe('env', () => {
  const originalProcessEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalProcessEnv };
  });

  afterAll(() => {
    process.env = originalProcessEnv;
  });

  it('should return value from process.env if available', () => {
    process.env.TEST_KEY = 'test_value';
    expect(getEnv('TEST_KEY', 'default_val')).toBe('test_value');
  });

  it('should return defaultValue if process.env key is not set', () => {
    delete process.env.TEST_KEY;
    expect(getEnv('TEST_KEY', 'default_val')).toBe('default_val');
  });

  it('should return empty string if no defaultValue provided and key not found', () => {
    delete process.env.TEST_KEY;
    expect(getEnv('TEST_KEY')).toBe('');
  });

  it('should evaluate import.meta safely if process.env is undefined', () => {
    const originalEnv = process.env;
    // @ts-expect-error simulating non-node environment without process.env
    delete global.process;

    try {
      expect(getEnv('VITE_NON_EXISTENT', 'fallback')).toBe('fallback');
    } finally {
      // @ts-expect-error restoring global.process
      global.process = { env: originalEnv };
    }
  });
});
