import { httpClient } from '../httpClient';

describe('httpClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('get', () => {
    it('should perform GET request and return parsed JSON on success', async () => {
      const mockData = [{ id: '1', name: 'Product 1' }];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as unknown as Response);

      const result = await httpClient.get<typeof mockData>('/products');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(result).toEqual(mockData);
    });

    it('should throw an error when GET response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);

      await expect(httpClient.get('/products')).rejects.toThrow('GET /products failed: 500');
    });
  });

  describe('post', () => {
    it('should perform POST request with body and return parsed JSON on success', async () => {
      const payload = { name: 'Item', price: 20 };
      const responseData = { id: '100', ...payload };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => responseData,
      } as unknown as Response);

      const result = await httpClient.post<typeof responseData>('/products', payload);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      expect(result).toEqual(responseData);
    });

    it('should throw an error when POST response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      } as unknown as Response);

      await expect(httpClient.post('/products', {})).rejects.toThrow('POST /products failed: 400');
    });
  });
});
