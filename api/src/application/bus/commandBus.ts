// ─────────────────────────────────────────────────────────────────────────────
// CQRS Infrastructure: CommandBus
// Decouples controllers from individual command handlers.
// Controllers dispatch commands; CommandBus routes to the registered handler.
// ─────────────────────────────────────────────────────────────────────────────

export interface Command {
  readonly type: string;
}

export interface CommandHandler<TCommand extends Command = any, TResult = any> {
  execute(command: TCommand): Promise<TResult>;
}

export class CommandBus {
  private readonly handlers = new Map<string, CommandHandler<any, any>>();

  register(commandType: string, handler: CommandHandler<any, any>): void {
    if (this.handlers.has(commandType)) {
      throw new Error(`Handler already registered for command: ${commandType}`);
    }
    this.handlers.set(commandType, handler);
  }

  async execute<TResult = unknown>(command: Command): Promise<TResult> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }
    return handler.execute(command);
  }
}
