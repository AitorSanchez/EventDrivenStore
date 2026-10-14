// ─────────────────────────────────────────────────────────────────────────────
// Query DTO: GetProductByIdQuery
// Read-side query for fetching a product by ID.
// ─────────────────────────────────────────────────────────────────────────────

import { Query } from '../bus/queryBus';

export class GetProductByIdQuery implements Query {
  static readonly QUERY_TYPE = 'GetProductById';
  readonly type = GetProductByIdQuery.QUERY_TYPE;

  constructor(public readonly productId: string) {}
}
