import { ProcessedEvent } from '../../src/models/ProcessedEvent';

describe('ProcessedEvent Model (Worker)', () => {
  it('validates a valid processed event', () => {
    const event = new ProcessedEvent({
      eventId: 'evt-uuid-1234',
      eventType: 'order.created',
    });

    const err = event.validateSync();
    expect(err).toBeUndefined();
    expect(event.eventId).toBe('evt-uuid-1234');
    expect(event.eventType).toBe('order.created');
  });

  it('fails validation when required fields are missing', () => {
    const event = new ProcessedEvent({});
    const err = event.validateSync();

    expect(err).toBeDefined();
    expect(err?.errors['eventId']).toBeDefined();
    expect(err?.errors['eventType']).toBeDefined();
  });
});
