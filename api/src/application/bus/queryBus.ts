// ─────────────────────────────────────────────────────────────────────────────
// CQRS Infrastructure: QueryBus
// Decouples controllers from individual query handlers.
// Controllers dispatch queries; QueryBus routes to the registered handler.
// ─────────────────────────────────────────────────────────────────────────────

export interface Query {
  readonly type: string;
}

export interface QueryHandler<TQuery extends Query = any, TResult = any> {
  execute(query: TQuery): Promise<TResult>;
}

export class QueryBus {
  private readonly handlers = new Map<string, QueryHandler<any, any>>();

  register(queryType: string, handler: QueryHandler<any, any>): void {
    if (this.handlers.has(queryType)) {
      throw new Error(`Handler already registered for query: ${queryType}`);
    }
    this.handlers.set(queryType, handler);
  }

  async execute<TResult = unknown>(query: Query): Promise<TResult> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.type}`);
    }
    return handler.execute(query);
  }
}
