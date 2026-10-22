import { Product } from '../../src/models/Product';

describe('Product Model (Worker)', () => {
  it('validates a valid product', () => {
    const product = new Product({
      name: 'Test Product',
      price: 25,
      availableStock: 50,
      reservedStock: 5,
    });

    const err = product.validateSync();
    expect(err).toBeUndefined();
    expect(product.name).toBe('Test Product');
  });

  it('fails validation on missing required fields', () => {
    const product = new Product({});
    const err = product.validateSync();

    expect(err).toBeDefined();
    expect(err?.errors['name']).toBeDefined();
    expect(err?.errors['price']).toBeDefined();
  });

  it('defaults availableStock and reservedStock to 0', () => {
    const product = new Product({
      name: 'Item',
      price: 10,
    });

    expect(product.availableStock).toBe(0);
    expect(product.reservedStock).toBe(0);
    expect(product.validateSync()).toBeUndefined();
  });
});
