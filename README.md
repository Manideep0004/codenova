# Codenova: Cloud-Based Online Code Execution Platform

Codenova is a production-ready, full-stack platform for online code execution, built by Manideep0004.

## Tech Stack
- **Frontend**: React.js, Monaco Editor, Tailwind CSS
- **Backend**: Node.js, Express.js, Sequelize (PostgreSQL)
- **Code Execution Engine**: Docker SDK (Dockerode)
- **Infrastructure**: AWS (EKS, RDS, S3, ECR), Terraform
- **CI/CD**: Jenkins

## Repository Structure
- `/frontend` - React single-page application.
- `/backend` - Node.js/Express REST API and Code Execution Engine.
- `/k8s` - Kubernetes manifests for cluster deployment.
- `/terraform` - AWS Infrastructure as Code.
- `/jenkins` - CI/CD pipeline scripts and configuration.
- `/docs` - Project documentation.

## Getting Started
Please refer to the following documents for setup instructions:
- [Local Setup (Docker Compose)](docs/LOCAL_SETUP.md)
- [Deployment (AWS & Terraform)](docs/DEPLOYMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
