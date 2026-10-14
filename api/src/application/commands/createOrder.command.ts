// ─────────────────────────────────────────────────────────────────────────────
// Command DTO: CreateOrderCommand
// Immutable data object representing the intent to place an order.
// ─────────────────────────────────────────────────────────────────────────────

import { Command } from '../bus/commandBus';

export class CreateOrderCommand implements Command {
  static readonly COMMAND_TYPE = 'CreateOrder';
  readonly type = CreateOrderCommand.COMMAND_TYPE;

  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly customerEmail: string,
  ) {}
}
