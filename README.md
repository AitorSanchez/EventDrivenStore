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
- **Clean Architecture:** Strict separation between routes, controllers, and the business logic (services).
- **Idempotency & Resiliency:** MongoDB `$inc` operations are used to prevent race conditions, and RabbitMQ `ack`/`nack` disciplines ensure no messages are lost if a worker fails.

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
