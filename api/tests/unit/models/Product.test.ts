import { Product } from '../../../src/models/Product';

describe('Product Model Schema Validation', () => {
  it('validates a valid product', () => {
    const product = new Product({
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: 29.99,
      availableStock: 10,
      reservedStock: 0,
    });

    const err = product.validateSync();
    expect(err).toBeUndefined();
    expect(product.name).toBe('Wireless Mouse');
    expect(product.price).toBe(29.99);
  });

  it('applies default values for availableStock and reservedStock', () => {
    const product = new Product({
      name: 'Keyboard',
      price: 49.99,
    });

    expect(product.availableStock).toBe(0);
    expect(product.reservedStock).toBe(0);
    const err = product.validateSync();
    expect(err).toBeUndefined();
  });

  it('fails validation when required fields are missing', () => {
    const product = new Product({});
    const err = product.validateSync();

    expect(err).toBeDefined();
    expect(err?.errors['name']).toBeDefined();
    expect(err?.errors['price']).toBeDefined();
  });

  it('fails validation when price is negative', () => {
    const product = new Product({
      name: 'Item',
      price: -5,
      availableStock: 10,
    });

    const err = product.validateSync();
    expect(err).toBeDefined();
    expect(err?.errors['price']).toBeDefined();
  });

  it('fails validation when availableStock is negative', () => {
    const product = new Product({
      name: 'Item',
      price: 10,
      availableStock: -1,
    });

    const err = product.validateSync();
    expect(err).toBeDefined();
    expect(err?.errors['availableStock']).toBeDefined();
  });

  it('trims whitespace from name and description', () => {
    const product = new Product({
      name: '  Clean Name  ',
      description: '  Clean description  ',
      price: 15,
    });

    expect(product.name).toBe('Clean Name');
    expect(product.description).toBe('Clean description');
  });
});
