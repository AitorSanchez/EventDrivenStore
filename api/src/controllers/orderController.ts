import { Request, Response, NextFunction } from 'express';
import { commandBus, queryBus } from '../container';
import { CreateOrderCommand } from '../application/commands/createOrder.command';
import { CreateOrderResult } from '../application/commands/createOrder.handler';
import { GetOrderByIdQuery } from '../application/queries/getOrderById.query';
import { OrderViewData } from '../ports/orderRepository.port';

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const command = new CreateOrderCommand(
      req.body.productId,
      req.body.quantity,
      req.body.customerEmail,
    );
    const { order, eventId } = await commandBus.execute<CreateOrderResult>(command);

    // 202 Accepted: stock is reserved, payment processing is asynchronous
    res.status(202).json({
      message: 'Order accepted. Payment is being processed.',
      orderId: order.id,
      status: order.status,
      eventId,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = new GetOrderByIdQuery(req.params.id);
    const order = await queryBus.execute<OrderViewData | null>(query);
    if (!order) {
      res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      return;
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
}
