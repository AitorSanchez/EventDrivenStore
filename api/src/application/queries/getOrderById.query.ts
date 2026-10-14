// ─────────────────────────────────────────────────────────────────────────────
// Query DTO: GetOrderByIdQuery
// Read-side query for fetching an order with populated product details.
// ─────────────────────────────────────────────────────────────────────────────

import { Query } from '../bus/queryBus';

export class GetOrderByIdQuery implements Query {
  static readonly QUERY_TYPE = 'GetOrderById';
  readonly type = GetOrderByIdQuery.QUERY_TYPE;

  constructor(public readonly orderId: string) {}
}
