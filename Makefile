.PHONY: du dr den de dd test test-api test-worker test-ui test-postman help

# Default target
help:
	@echo "Available commands:"
	@echo "  make du           - Start all containers in detached mode (docker-compose up -d)"
	@echo "  make dr           - Restart all containers (docker-compose restart)"
	@echo "  make den          - Enter the frontend container console (sh)"
	@echo "  make de           - Enter the api container console (sh)"
	@echo "  make dd           - Destroy all containers, networks, and volumes (docker-compose down -v)"
	@echo "  make test         - Run tests for all services"
	@echo "  make test-api     - Run tests for the API service only"
	@echo "  make test-worker  - Run tests for the Worker service only"
	@echo "  make test-ui      - Run tests for the Frontend (UI) service only"
	@echo "  make test-postman - Execute Postman collection tests using Newman in API container"

# Start the containers
du:
	docker-compose up -d

# Restart the containers
dr:
	docker-compose restart

# Enter the frontend container shell
# Note: The frontend container name will be eventstore-frontend once Phase 4 is built
den:
	docker exec -it eventstore-frontend sh

# Enter the api container shell
de:
	docker exec -it eventstore-api sh

# Destroy all containers and volumes
dd:
	docker-compose down -v

# Run tests
test: test-api test-worker

# Run API tests
test-api:
	@echo "Running API tests..."
	docker exec eventstore-api npm test || (cd api && npm test)

# Run Worker tests
test-worker:
	@echo "Running Worker tests..."
	docker exec eventstore-worker npm test

# Run Frontend tests
test-ui:
	@echo "Running Frontend tests..."
	@if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then cd frontend && npm test; else echo "Frontend (Phase 4) not implemented yet."; fi

# Run Postman integration tests via Newman in API container
test-postman:
	@echo "Running Postman integration tests..."
	docker exec -it eventstore-api npx newman run /app/tests/postman/postman_collection.json
