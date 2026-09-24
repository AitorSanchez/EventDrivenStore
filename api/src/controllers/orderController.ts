import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/orderService';

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { order, eventId } = await orderService.createOrder(req.body);
    // 202 Accepted: stock is reserved, payment processing is asynchronous
    res.status(202).json({
      message: 'Order accepted. Payment is being processed.',
      orderId: order._id,
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
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      return;
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
}
