import { render, screen } from '@testing-library/react';
import CatalogList from '../CatalogList';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../domain/types';

jest.mock('../../hooks/useProducts');

describe('CatalogList', () => {
  const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading status when loading is true', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      loading: true,
      error: null,
    });

    render(<CatalogList />);

    expect(screen.getByText('Loading products…')).toBeInTheDocument();
  });

  it('should render error message when error occurs', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: 'Failed to fetch catalog',
    });

    render(<CatalogList />);

    expect(screen.getByText('Failed to fetch catalog')).toBeInTheDocument();
  });

  it('should render empty message when no products are available', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
    });

    render(<CatalogList />);

    expect(screen.getByText('No products available.')).toBeInTheDocument();
  });

  it('should render the list of product cards when products are loaded', () => {
    const products: Product[] = [
      {
        id: 'p1',
        name: 'Desk Lamp',
        description: 'LED dimmable light',
        price: 35.0,
        availableStock: 8,
      },
      {
        id: 'p2',
        name: 'Coffee Mug',
        description: 'Ceramic 350ml mug',
        price: 12.5,
        availableStock: 0,
      },
    ];

    mockUseProducts.mockReturnValue({
      products,
      loading: false,
      error: null,
    });

    render(<CatalogList />);

    expect(screen.getByText('Desk Lamp')).toBeInTheDocument();
    expect(screen.getByText('Coffee Mug')).toBeInTheDocument();
  });
});
