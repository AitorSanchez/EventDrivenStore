import { AppError, NotFoundError, InsufficientStockError } from '../../../src/domain/errors';

describe('Domain Errors', () => {
  describe('AppError', () => {
    it('initializes with message, statusCode, and code', () => {
      const error = new AppError('Custom error', 418, 'I_AM_A_TEAPOT');

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe('I_AM_A_TEAPOT');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('NotFoundError', () => {
    it('sets 404 status code, formatted message, and uppercase code', () => {
      const error = new NotFoundError('Product', 'prod-123');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('PRODUCT_NOT_FOUND');
      expect(error.message).toBe('Product not found: prod-123');
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('InsufficientStockError', () => {
    it('sets 400 status code, INSUFFICIENT_STOCK code, and informative message', () => {
      const error = new InsufficientStockError(10, 3);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INSUFFICIENT_STOCK');
      expect(error.message).toBe('Insufficient stock. Requested: 10, Available: 3');
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(InsufficientStockError);
    });
  });
});
