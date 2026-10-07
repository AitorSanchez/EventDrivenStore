# EventDrivenStore — Implementation Plan

## 🏗️ Project Overview

A distributed, event-driven e-commerce platform that decouples order processing from inventory and notification logic using RabbitMQ as the message broker, MongoDB as the primary data store, and a React frontend.

---

## 📐 Architecture

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   Frontend  │ ──────▶│    API Service   │ ──────▶│    RabbitMQ     │
│  (React)    │        │  (Express/TS)    │        │  Message Broker │
└─────────────┘        └──────────────────┘        └────────┬────────┘
                              │                             │
                              ▼                             ▼
                        ┌──────────┐              ┌─────────────────┐
                        │ MongoDB  │◀─────────────│  Worker Service │
                        │          │              │  (Consumer/TS)  │
                        └──────────┘              └─────────────────┘
```

---

## 📁 Folder Structure

```
EventDrivenStore/
├── api/                          # Express API service
│   ├── src/
│   │   ├── config/               # DB & queue connection setup
│   │   ├── controllers/          # Route handlers (thin layer)
│   │   ├── services/             # Business logic
│   │   ├── models/               # Mongoose schemas/interfaces
│   │   ├── events/               # Event publishers (RabbitMQ)
│   │   ├── routes/               # Express router definitions
│   │   ├── middleware/           # Auth, validation, error handling
│   │   ├── types/                # Shared TS interfaces & DTOs
│   │   └── index.ts              # App entry point
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── worker/                       # Event consumer service
│   ├── src/
│   │   ├── config/               # Queue & DB connection
│   │   ├── consumers/            # Per-event consumers (ack/nack)
│   │   ├── handlers/             # Business logic per event type
│   │   ├── models/               # Shared/local Mongoose models
│   │   ├── types/                # Event payload interfaces
│   │   └── index.ts              # Worker entry point
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/             # API client
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── shared/                       # (future) Shared types/DTOs pkg
├── docker-compose.yml
├── .env.example
├── .cursorrules
└── README.md
```

---

## 🚀 Implementation Phases

### Phase 1 — Infrastructure Skeleton ✅ (current)
- [x] `.cursorrules` with behavioral & coding standards
- [x] `api/`, `worker/`, `frontend/` base directories
- [x] `docker-compose.yml` (MongoDB, RabbitMQ, API, Worker)
- [x] `Dockerfile` templates for API and Worker
- [x] `.env.example` with placeholder config

### Phase 2 — API Service Core ✅
- [x] Express app bootstrap (`index.ts`, middleware stack)
- [x] MongoDB connection module with retry logic
- [x] RabbitMQ publisher utility (channel pool, confirm mode)
- [x] Health-check endpoint (`GET /health`)
- [x] Product routes + CRUD controllers
- [x] Order routes + controller → publishes `order.created` event
- [x] Unit tests with Jest + Supertest
- [x] Postman collection exported with request examples and tests
- [x] Configure API Docker to execute Postman tests via Newman (with `make test-postman`)

### Phase 3 — Worker Service Core
- [ ] RabbitMQ consumer bootstrap with dead-letter exchange (DLX)
- [ ] `order.created` consumer → simulate payment processing
- [ ] On success → clear reservation (`$inc` atomic) and mark order completed
- [ ] On failure → saga compensation: rollback reservation and mark order cancelled
- [ ] Notification consumer stub (email/webhook)
- [ ] Unit tests with Jest

### Phase 4 — Frontend
- [ ] Vite + React + TypeScript scaffold
- [ ] Product catalog page
- [ ] Cart & checkout flow
- [ ] Order status polling / Server-Sent Events (SSE) listener
- [ ] Dark-mode design system

### Phase 5 — Hardening & Observability
- [ ] JWT authentication middleware
- [ ] Input validation with `zod`
- [ ] Structured logging with `pino`
- [ ] Prometheus metrics endpoint
- [ ] Docker Compose health-checks & depends_on ordering
- [ ] Integration test suite

---

## 🔑 Key Design Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Message broker | RabbitMQ (topic exchange) | Mature, supports DLX, management UI |
| Event durability | Persistent messages + durable queues | Survive broker restarts |
| Idempotency | Event ID stored in MongoDB | Prevent double-processing |
| Error handling | `nack` → DLX → dead-letter queue | Inspectable failures |
| DB operations | MongoDB `$inc` / `findOneAndUpdate` | Atomic reservations (dec available, inc reserved) to avoid race conditions |
| Architecture Pattern | Early Reservation + Saga | Prevents overselling while keeping HTTP responses ultra-fast |
| Type safety | Strict TypeScript, zod for runtime | Catches integration mismatches early |

---

## 🔌 Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | Full MongoDB connection string |
| `RABBITMQ_URL` | AMQP connection URL |
| `PORT` | API service listening port |
| `NODE_ENV` | `development` / `production` |
| `JWT_SECRET` | Token signing secret (Phase 5) |
| `RABBITMQ_EXCHANGE` | Exchange name (e.g. `store.events`) |
| `RABBITMQ_QUEUE_ORDERS` | Order queue name |
| `RABBITMQ_QUEUE_INVENTORY` | Inventory queue name |
