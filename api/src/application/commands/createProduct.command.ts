// ─────────────────────────────────────────────────────────────────────────────
// Command DTO: CreateProductCommand
// Immutable data object representing the intent to add a new product.
// ─────────────────────────────────────────────────────────────────────────────

import { Command } from '../bus/commandBus';

export class CreateProductCommand implements Command {
  static readonly COMMAND_TYPE = 'CreateProduct';
  readonly type = CreateProductCommand.COMMAND_TYPE;

  constructor(
    public readonly name: string,
    public readonly price: number,
    public readonly availableStock: number,
    public readonly description?: string,
  ) {}
}
