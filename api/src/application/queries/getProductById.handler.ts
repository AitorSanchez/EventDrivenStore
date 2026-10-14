// ─────────────────────────────────────────────────────────────────────────────
// Query Handler: GetProductByIdHandler
// Read-side handler — fetches a single product by ID.
// ─────────────────────────────────────────────────────────────────────────────

import { IProductRepository, ProductData } from '../../ports/productRepository.port';
import { QueryHandler } from '../bus/queryBus';
import { GetProductByIdQuery } from './getProductById.query';

export class GetProductByIdHandler implements QueryHandler<GetProductByIdQuery, ProductData | null> {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(query: GetProductByIdQuery): Promise<ProductData | null> {
    return this.productRepo.findById(query.productId);
  }
}
