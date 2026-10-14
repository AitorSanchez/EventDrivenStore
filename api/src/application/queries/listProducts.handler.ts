// ─────────────────────────────────────────────────────────────────────────────
// Query Handler: ListProductsHandler
// Read-side handler — returns all products sorted newest-first.
// ─────────────────────────────────────────────────────────────────────────────

import { IProductRepository, ProductData } from '../../ports/productRepository.port';
import { QueryHandler } from '../bus/queryBus';
import { ListProductsQuery } from './listProducts.query';

export class ListProductsHandler implements QueryHandler<ListProductsQuery, ProductData[]> {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(_query?: ListProductsQuery): Promise<ProductData[]> {
    return this.productRepo.findAll();
  }
}
