import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('../features/catalog', () => ({
  CatalogList: () => <div data-testid="catalog-list-mock">Catalog List Component</div>,
}));

describe('App', () => {
  it('should render the application header and the catalog list', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'EventDrivenStore Catalog' })).toBeInTheDocument();
    expect(screen.getByTestId('catalog-list-mock')).toBeInTheDocument();
  });
});
