// ─────────────────────────────────────────────────────────────────────────────
// Command DTO: UpdateProductCommand
// Immutable data object representing the intent to update an existing product.
// ─────────────────────────────────────────────────────────────────────────────

import { Command } from '../bus/commandBus';

export class UpdateProductCommand implements Command {
  static readonly COMMAND_TYPE = 'UpdateProduct';
  readonly type = UpdateProductCommand.COMMAND_TYPE;

  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly price?: number,
    public readonly availableStock?: number,
  ) {}
}
