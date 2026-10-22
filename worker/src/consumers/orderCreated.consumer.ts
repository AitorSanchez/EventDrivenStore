import { Channel, ConsumeMessage } from 'amqplib';
import pino from 'pino';
import { OrderCreatedEventSchema } from '../types/events';
import { OrderCreatedHandler } from '../handlers/orderCreated.handler';

const logger = pino({ name: 'order-created-consumer' });

export class OrderCreatedConsumer {
  constructor(
    private readonly channel: Channel,
    private readonly handler: OrderCreatedHandler = new OrderCreatedHandler()
  ) {}

  async start(queueName: string = process.env.RABBITMQ_QUEUE_ORDERS ?? 'orders'): Promise<void> {
    logger.info({ queueName }, 'Registering order.created consumer');

    await this.channel.consume(
      queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          logger.warn('Consumer received null message');
          return;
        }

        await this.processMessage(msg);
      },
      { noAck: false } // Manual acknowledgments
    );
  }

  async processMessage(msg: ConsumeMessage): Promise<void> {
    let rawContent: string;
    try {
      rawContent = msg.content.toString();
    } catch (err) {
      logger.error({ err }, 'Failed to read message buffer. Routing to DLQ.');
      this.channel.nack(msg, false, false);
      return;
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawContent);
    } catch (err) {
      logger.error({ err, rawContent }, 'Invalid JSON in message. Routing to DLQ.');
      this.channel.nack(msg, false, false);
      return;
    }

    // ── Runtime boundary validation with Zod ────────────────────────────────
    const parseResult = OrderCreatedEventSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      logger.error(
        { errors: parseResult.error.format(), parsedJson },
        'Message payload failed schema validation. Routing to DLQ.'
      );
      this.channel.nack(msg, false, false);
      return;
    }

    const event = parseResult.data;

    try {
      await this.handler.handle(event);
      this.channel.ack(msg);
      logger.info({ eventId: event.eventId, orderId: event.orderId }, 'Message processed and acked');
    } catch (err) {
      logger.error({ err, eventId: event.eventId, orderId: event.orderId }, 'Error processing order.created event');
      // On unrecoverable error, reject without requeue so message routes to DLQ
      this.channel.nack(msg, false, false);
    }
  }
}
