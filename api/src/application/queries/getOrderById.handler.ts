// ─────────────────────────────────────────────────────────────────────────────
// Query Handler: GetOrderByIdHandler
// Read-side handler — fetches a single order with populated product info.
// ─────────────────────────────────────────────────────────────────────────────

import { IOrderRepository, OrderViewData } from '../../ports/orderRepository.port';
import { QueryHandler } from '../bus/queryBus';
import { GetOrderByIdQuery } from './getOrderById.query';

export class GetOrderByIdHandler implements QueryHandler<GetOrderByIdQuery, OrderViewData | null> {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(query: GetOrderByIdQuery): Promise<OrderViewData | null> {
    return this.orderRepo.findByIdPopulated(query.orderId);
  }
}
