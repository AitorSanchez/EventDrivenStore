import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import { Product } from '../../domain/types';

describe('ProductCard', () => {
  const inStockProduct: Product = {
    _id: 'prod-123',
    name: 'Wireless Mouse',
    description: 'Ergonomic 2.4GHz mouse',
    price: 29.99,
    availableStock: 15,
  };

  const soldOutProduct: Product = {
    _id: 'prod-456',
    name: 'Vintage Camera',
    description: 'Classic 35mm film camera',
    price: 199.5,
    availableStock: 0,
  };

  it('should render product information correctly for in-stock items', () => {
    render(<ProductCard product={inStockProduct} />);

    expect(screen.getByRole('heading', { name: 'Wireless Mouse' })).toBeInTheDocument();
    expect(screen.getByText('Ergonomic 2.4GHz mouse')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('15 in stock')).toBeInTheDocument();
  });

  it('should render "Sold out" when availableStock is 0', () => {
    render(<ProductCard product={soldOutProduct} />);

    expect(screen.getByRole('heading', { name: 'Vintage Camera' })).toBeInTheDocument();
    expect(screen.getByText('$199.50')).toBeInTheDocument();
    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });
});
