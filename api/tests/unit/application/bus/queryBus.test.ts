import { QueryBus, Query, QueryHandler } from '../../../../src/application/bus/queryBus';

describe('QueryBus', () => {
  let queryBus: QueryBus;

  beforeEach(() => {
    queryBus = new QueryBus();
  });

  class TestQuery implements Query {
    readonly type = 'TestQuery';
    constructor(public readonly id: string) {}
  }

  it('registers and executes query handler', async () => {
    const mockHandler: QueryHandler<TestQuery, { id: string }> = {
      execute: jest.fn().mockResolvedValue({ id: '123' }),
    };

    queryBus.register('TestQuery', mockHandler);
    const result = await queryBus.execute(new TestQuery('123'));

    expect(result).toEqual({ id: '123' });
    expect(mockHandler.execute).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
  });

  it('throws an error if a handler is registered more than once for the same query type', () => {
    const mockHandler: QueryHandler<TestQuery, unknown> = {
      execute: jest.fn(),
    };

    queryBus.register('TestQuery', mockHandler);
    expect(() => queryBus.register('TestQuery', mockHandler)).toThrow(
      'Handler already registered for query: TestQuery'
    );
  });

  it('throws an error if no handler is registered for a dispatched query', async () => {
    const unregisteredQuery = new TestQuery('unhandled');

    await expect(queryBus.execute(unregisteredQuery)).rejects.toThrow(
      'No handler registered for query: TestQuery'
    );
  });
});
