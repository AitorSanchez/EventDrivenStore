# EventDrivenStore — Cursor Rules & Coding Standards

## 🛑 Behavioral & Safety Constraints (Strictly Enforced)

1. **NO AUTO-COMMITS:** Never run `git commit`, `git push`, or `git branch` commands unless
   explicitly instructed by the user.
2. **ASK BEFORE DESTRUCTIVE ACTIONS:** Do not delete files or alter project architecture
   without prior confirmation from the user.
3. **INCREMENTAL EXECUTION:** Propose an implementation plan first. Build modular,
   reviewable pieces of code — never dump hundreds of lines without explanation.
4. **TEST COVERAGE:** Add unit tests for every feature implemented (backend or frontend)
   and execute them before finishing. If any test fails, debug and fix it before proceeding.

---

## 💻 Coding Standards

### Architecture
- **Clean Architecture:** Keep business logic strictly decoupled from infrastructure.
  - Separate database models/queries from controllers.
  - Separate queue consumers from business handlers.
  - No DB calls inside route handlers — delegate to service layer.
- **Layer responsibilities:**
  - `routes/` → Express router definitions only
  - `controllers/` → Thin HTTP handlers; delegate to services
  - `services/` → All business logic
  - `models/` → Mongoose schemas + TypeScript interfaces
  - `events/` → RabbitMQ publishers/consumers
  - `config/` → External connection setup (DB, broker)

### TypeScript
- **Strict Mode:** Enable `strict: true` in `tsconfig.json`.
- **No `any`:** Define proper interfaces or DTOs for every event payload and document.
- **DTOs for events:** Every RabbitMQ message must have a typed interface in `types/`.
- **No implicit returns:** Functions must have explicit return types.

### Resiliency
- **Atomic MongoDB operations:** Always prefer `$inc`, `$set`, `findOneAndUpdate` over
  read-modify-write patterns to avoid race conditions.
- **RabbitMQ ack/nack discipline:**
  - `ack()` only after successful processing.
  - `nack(msg, false, false)` on unrecoverable errors → routes to DLX.
  - `nack(msg, false, true)` for transient failures (retry).
- **Dead-Letter Exchange (DLX):** Every consumer queue must be backed by a DLX + DLQ.
- **Idempotency:** Store processed event IDs in MongoDB to prevent double-processing.

### Error Handling
- All async route handlers wrapped with `express-async-errors` or try/catch.
- Structured error responses: `{ error: string, code: string, details?: unknown }`.
- Use `pino` for structured JSON logging — no `console.log` in production code.

### Testing
- Framework: **Jest** with **ts-jest**.
- API integration tests: **Supertest**.
- Mocking: Use `jest.mock()` for DB and RabbitMQ — no live services in unit tests.
- Minimum coverage threshold: **80%** for services and handlers.
- Test file convention: `*.test.ts` co-located with source or inside `tests/`.

### Environment & Config
- All secrets and URLs read from environment variables via `process.env`.
- Never hardcode connection strings, ports, or secrets.
- Validate required env vars at startup and fail fast if missing.

---

## 📦 Package Conventions

- **Runtime:** Node.js ≥ 20 (LTS).
- **Package manager:** `npm`.
- **API framework:** Express.js.
- **ODM:** Mongoose.
- **AMQP client:** `amqplib`.
- **Validation:** `zod`.
- **Logging:** `pino` + `pino-http`.

---

## 🗂️ File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Source files | `camelCase.ts` | `orderService.ts` |
| Interfaces/DTOs | `PascalCase` suffix `Dto` or `Event` | `OrderCreatedEvent` |
| Mongoose models | `PascalCase` | `Order`, `Product` |
| Test files | `*.test.ts` | `orderService.test.ts` |
| Route files | `*.routes.ts` | `order.routes.ts` |
| Consumer files | `*.consumer.ts` | `orderCreated.consumer.ts` |
