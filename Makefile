.PHONY: dev build test deploy

# Start the local development environment using Docker Compose
dev:
	docker-compose -f docker-compose.yml up --build

# Build production Docker images for frontend and backend
build:
	docker-compose -f docker-compose.prod.yml build

# Run unit and integration tests
test:
	cd backend && npm test
	cd frontend && npm test

# Deploy to Kubernetes cluster
deploy:
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secrets.yaml
	kubectl apply -f k8s/backend/
	kubectl apply -f k8s/frontend/
	kubectl apply -f k8s/ingress.yaml
