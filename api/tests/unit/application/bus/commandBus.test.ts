import { CommandBus, Command, CommandHandler } from '../../../../src/application/bus/commandBus';

describe('CommandBus', () => {
  let commandBus: CommandBus;

  beforeEach(() => {
    commandBus = new CommandBus();
  });

  class TestCommand implements Command {
    readonly type = 'TestCommand';
    constructor(public readonly value: string) {}
  }

  it('registers and executes command handler', async () => {
    const mockHandler: CommandHandler<TestCommand, string> = {
      execute: jest.fn().mockResolvedValue('success'),
    };

    commandBus.register('TestCommand', mockHandler);
    const result = await commandBus.execute(new TestCommand('hello'));

    expect(result).toBe('success');
    expect(mockHandler.execute).toHaveBeenCalledWith(expect.objectContaining({ value: 'hello' }));
  });

  it('throws an error if a handler is registered more than once for the same command type', () => {
    const mockHandler: CommandHandler<TestCommand, string> = {
      execute: jest.fn(),
    };

    commandBus.register('TestCommand', mockHandler);
    expect(() => commandBus.register('TestCommand', mockHandler)).toThrow(
      'Handler already registered for command: TestCommand'
    );
  });

  it('throws an error if no handler is registered for a dispatched command', async () => {
    const unregisteredCommand = new TestCommand('unhandled');

    await expect(commandBus.execute(unregisteredCommand)).rejects.toThrow(
      'No handler registered for command: TestCommand'
    );
  });
});
