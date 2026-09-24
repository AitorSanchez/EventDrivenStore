.PHONY: du dr den de dd test test-api test-ui help

# Default target
help:
	@echo "Available commands:"
	@echo "  make du    - Start all containers in detached mode (docker-compose up -d)"
	@echo "  make dr    - Restart all containers (docker-compose restart)"
	@echo "  make den   - Enter the frontend container console (sh)"
	@echo "  make de    - Enter the api container console (sh)"
	@echo "  make dd        - Destroy all containers, networks, and volumes (docker-compose down -v)"
	@echo "  make test      - Run tests for both API and Worker services"
	@echo "  make test-api  - Run tests for the API service only"
	@echo "  make test-ui   - Run tests for the Frontend (UI) service only"

# Start the containers
du:
	docker compose up -d

# Restart the containers
dr:
	docker compose restart

# Enter the frontend container shell
# Note: The frontend container name will be eventstore-frontend once Phase 4 is built
den:
	docker exec -it eventstore-frontend sh

# Enter the api container shell
de:
	docker exec -it eventstore-api sh

# Destroy all containers and volumes
dd:
	docker compose down -v

# Run tests
test: test-api test-ui
	@echo "\nRunning Worker tests..."
	cd worker && npm test

# Run API tests
test-api:
	@echo "Running API tests..."
	cd api && npm test

# Run Frontend tests
test-ui:
	@echo "Running Frontend tests..."
	cd frontend && npm test
