import { productApi } from '../productApi';
import { httpClient } from '../../../../shared/api/httpClient';

jest.mock('../../../../shared/api/httpClient');

describe('productApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should fetch raw products and map them to domain Product models', async () => {
      const mockRawResponse = [
        {
          id: 'prod-1',
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 99.99,
          availableStock: 10,
          reservedStock: 2,
        },
        {
          id: 'prod-2',
          name: 'Mouse',
          description: 'Gaming mouse',
          price: 49.99,
          // availableStock is undefined to test default fallback
        },
      ];

      (httpClient.get as jest.Mock).mockResolvedValue(mockRawResponse);

      const products = await productApi.fetchAll();

      expect(httpClient.get).toHaveBeenCalledWith('/products');
      expect(products).toEqual([
        {
          id: 'prod-1',
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 99.99,
          availableStock: 10,
        },
        {
          id: 'prod-2',
          name: 'Mouse',
          description: 'Gaming mouse',
          price: 49.99,
          availableStock: 0,
        },
      ]);
    });

    it('should propagate errors when httpClient.get fails', async () => {
      (httpClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(productApi.fetchAll()).rejects.toThrow('Network error');
    });
  });
});
