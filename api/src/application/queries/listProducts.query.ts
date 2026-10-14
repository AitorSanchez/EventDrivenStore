// ─────────────────────────────────────────────────────────────────────────────
// Query DTO: ListProductsQuery
// Read-side query for fetching all products.
// ─────────────────────────────────────────────────────────────────────────────

import { Query } from '../bus/queryBus';

export class ListProductsQuery implements Query {
  static readonly QUERY_TYPE = 'ListProducts';
  readonly type = ListProductsQuery.QUERY_TYPE;
}
