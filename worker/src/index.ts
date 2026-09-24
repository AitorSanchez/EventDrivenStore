/**
 * EventDrivenStore — Worker Service Entry Point (stub)
 *
 * Phase 3 will expand this into:
 *  - MongoDB connection with retry
 *  - RabbitMQ consumer bootstrap (DLX, prefetch, ack/nack discipline)
 *  - Per-event consumer registration
 */

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';

console.log(`[worker] Starting — broker: ${RABBITMQ_URL}`);
console.log('[worker] No consumers registered yet. Phase 3 coming soon.');

// Prevent the process from exiting while waiting for events
process.stdin.resume();

process.on('SIGTERM', () => {
  console.log('[worker] SIGTERM received — shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[worker] SIGINT received — shutting down gracefully');
  process.exit(0);
});
