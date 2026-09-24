/**
 * EventDrivenStore — API Service Entry Point (stub)
 *
 * Phase 2 will expand this into:
 *  - MongoDB connection with retry
 *  - RabbitMQ channel setup
 *  - Express middleware stack (pino-http, zod validation, error handler)
 *  - Route registration
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[api] Listening on port ${PORT}`);
});

export default app;
