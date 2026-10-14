# EventDrivenStore

A distributed, event-driven e-commerce platform built to demonstrate scalable backend patterns and decoupled architecture.

## 🏗️ Project Summary & Architecture

This project implements an **Early Reservation Pattern (Synchronous Reservation + Asynchronous Processing)** to decouple order processing from payment and fulfillment logic, ensuring both high responsiveness and data consistency.

### Order Processing Workflow:
1. **API (Synchronous):** When a user places an order, the API immediately validates and performs an **atomic stock reservation** in MongoDB (decrementing `available_stock` and incrementing `reserved_stock` safely). 
   - If stock is insufficient, the API rejects the request *immediately* (HTTP 400).
   - If stock is available, it publishes an `order.created` event to RabbitMQ and returns `202 Accepted` to the client.
2. **Worker (Asynchronous):** The background worker consumes the event, simulates the payment processing, and:
   - **On Success:** Finalizes the order (clears the reservation) and marks it as completed.
   - **On Failure (Saga Pattern / Compensation):** Performs a compensation transaction, rolling back the stock reservation (returning `reserved_stock` to `available_stock`) and marking the order as cancelled due to payment failure.
3. **Real-time (SSE):** The API notifies the React frontend about state updates via Server-Sent Events.

### Technology Stack
- **Backend API:** Node.js, Express, TypeScript
- **Event Consumer (Worker):** Node.js, TypeScript (Pure consumer process)
- **Message Broker:** RabbitMQ (Topic exchanges, Dead-Letter Queues for error handling)
- **Database:** MongoDB (using Mongoose for schemas and atomic operations)
- **Validation:** Zod (Runtime boundary validation and TypeScript type inference)
- **Frontend:** React + Vite (Coming in Phase 4)

### Architectural Patterns Used
- **Event-Driven Architecture:** Services communicate via RabbitMQ events rather than direct HTTP calls.
- **Hexagonal Architecture (Ports & Adapters):** Core business logic is decoupled from external tools, databases, and message brokers via explicit interfaces.
- **CQRS (Command Query Responsibility Segregation):** Write operations (Commands) and read operations (Queries) are split into dedicated handlers and dispatched via an in-memory bus.
- **Idempotency & Resiliency:** MongoDB `$inc` operations are used to prevent race conditions, and RabbitMQ `ack`/`nack` disciplines ensure no messages are lost if a worker fails.

---

## 🏛️ Hexagonal Architecture & CQRS (API Service)

The API service (`api/src/`) is structured following **Hexagonal Architecture (Ports & Adapters)** combined with a lightweight **CQRS** pattern:

```text
api/src/
├── domain/                  # Enterprise business rules & typed domain errors (framework-free)
│   └── errors.ts
│
├── ports/                   # Inbound & outbound contracts (interfaces only)
│   ├── productRepository.port.ts
│   ├── orderRepository.port.ts
│   └── eventPublisher.port.ts
│
├── application/             # Application business logic (CQRS)
│   ├── bus/                 # CommandBus & QueryBus dispatchers
│   │   ├── commandBus.ts
│   │   └── queryBus.ts
│   ├── commands/            # Write operations (Command DTOs + Handlers)
│   │   ├── createOrder.{command,handler}.ts
│   │   ├── createProduct.{command,handler}.ts
│   │   └── updateProduct.{command,handler}.ts
│   └── queries/             # Read operations (Query DTOs + Handlers)
│       ├── getOrderById.{query,handler}.ts
│       ├── getProductById.{query,handler}.ts
│       └── listProducts.{query,handler}.ts
│
├── infrastructure/          # Adapters (implementing ports)
│   ├── database/            # Mongoose implementations (MongoProductRepository, MongoOrderRepository)
│   └── messaging/           # AMQP implementations (RabbitMqPublisher)
│
├── controllers/             # Thin HTTP endpoints delegating to CommandBus/QueryBus
├── container.ts             # Composition Root (Dependency Injection & bus registration)
└── app.ts / index.ts        # Express setup & server bootloader
```

### Key Architectural Benefits:

1. **Decoupled from Frameworks & Storage:**  
   Command and Query handlers only depend on abstract ports (`IProductRepository`, `IOrderRepository`, `IEventPublisher`). MongoDB or RabbitMQ can be replaced or mocked without modifying a single line of business logic.
2. **Command & Query Separation:**  
   Write side (e.g. stock reservations, order placement) and read side (e.g. product listings, order lookups) are strictly segregated, making each flow focused, easily auditable, and testable.
3. **Dispatcher Pattern (`CommandBus` & `QueryBus`):**  
   Express controllers do not instantiate or couple to specific handlers. Controllers dispatch commands/queries via the bus (`commandBus.execute(new CreateOrderCommand(...))`), enabling cross-cutting concerns (logging, metrics, validation) to be applied transparently.
4. **Isolated Unit Testing:**  
   Because all handlers receive ports via constructor injection, unit tests run purely in-memory using lightweight mocks without spinning up MongoDB or RabbitMQ.

---

## 🚀 Setup Instructions

1. **Clone the repository** (if you haven't already).
2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   *You can leave the default values in `.env` as they are pre-configured for the Docker Compose network.*
3. **Start the infrastructure:**
   ```bash
   make du
   ```
4. **Access the services:**
   - **API:** http://localhost:3000/health
   - **RabbitMQ UI:** http://localhost:15672 (Credentials: `guest` / `guest`)

---

## 🛠️ Available Make Commands

We use a `Makefile` to simplify common Docker and testing commands.

| Command | Description |
|---|---|
| `make du` | **Docker Up**: Starts all containers in detached mode (`docker compose up -d`). |
| `make dr` | **Docker Restart**: Restarts all containers. |
| `make de` | **Docker Enter (API)**: Opens an interactive shell inside the API container. |
| `make den` | **Docker Enter (Frontend)**: Opens an interactive shell inside the Frontend container. |
| `make dd` | **Docker Destroy**: Stops and removes all containers, networks, and persistent data volumes. |
| `make test` | **Test**: Runs the Jest test suites for both the API and Worker services. |

---

## 📁 Directory Structure

- `api/` — The Express HTTP server acting as the gateway.
- `worker/` — The background processor listening to RabbitMQ.
- `frontend/` — The React application.
- `docker-compose.yml` — Orchestrates the network, database, broker, and services.
