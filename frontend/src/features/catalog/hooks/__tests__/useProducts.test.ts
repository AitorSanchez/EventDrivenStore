import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '../useProducts';
import { productApi } from '../../api/productApi';
import { Product } from '../../domain/types';

jest.mock('../../api/productApi');

describe('useProducts', () => {
  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Monitor',
      description: '4K IPS display',
      price: 349.99,
      availableStock: 5,
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading: true and fetch products successfully', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
  });

  it('should handle Error instances when fetching fails', async () => {
    (productApi.fetchAll as jest.Mock).mockRejectedValue(new Error('Failed to connect'));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe('Failed to connect');
  });

  it('should handle non-Error exceptions when fetching fails', async () => {
    (productApi.fetchAll as jest.Mock).mockRejectedValue('Unknown string error');

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe('Failed to load products');
  });

  it('should cancel state updates if component unmounts before fetch completes', async () => {
    let resolvePromise: (value: Product[]) => void = () => {};
    const pendingPromise = new Promise<Product[]>((resolve) => {
      resolvePromise = resolve;
    });

    (productApi.fetchAll as jest.Mock).mockReturnValue(pendingPromise);

    const { result, unmount } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    unmount();

    resolvePromise(mockProducts);

    expect(result.current.products).toEqual([]);
  });
});
