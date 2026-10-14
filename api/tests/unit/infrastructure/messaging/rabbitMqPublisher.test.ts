import { RabbitMqPublisher } from '../../../../src/infrastructure/messaging/rabbitMqPublisher';
import { publishEvent } from '../../../../src/config/rabbitmq';

jest.mock('../../../../src/config/rabbitmq', () => ({
  publishEvent: jest.fn(),
}));

describe('RabbitMqPublisher', () => {
  it('delegates publish to publishEvent config function', () => {
    const publisher = new RabbitMqPublisher();
    publisher.publish('test.event', { data: 'hello' });

    expect(publishEvent).toHaveBeenCalledWith('test.event', { data: 'hello' });
  });
});
