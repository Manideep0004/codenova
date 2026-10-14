# CodeNova: A Cloud-Native Secure Online Code Execution Platform

> **Academic Project** — Bachelor of Technology in Computer Science and Engineering  
> **Author:** Gudiya Manideep (Reg. No: 12322973)  
> **Institution:** Lovely Professional University, Punjab  
> **Academic Year:** 2025–2026

---

## 🌟 Executive Summary

**CodeNova** is an enterprise-grade, cloud-native online code execution platform designed to eliminate Remote Code Execution (RCE) vulnerabilities, fork bombs, and resource starvation.

### Key Highlights
- **Decoupled 6-Tier Architecture:** Client SPA $\to$ Express.js API Gateway $\to$ Redis Bull Job Queue $\to$ Code Execution Worker $\to$ PostgreSQL Persistence $\to$ Prometheus/Grafana Observability.
- **Sub-100ms Ingestion Latency:** Returns an immediate `HTTP 202 Accepted` acknowledgment token while compilation is processed asynchronously.
- **Hardened Kernel Sandboxing:** Ephemeral Docker containers with **256 MB RAM**, **1.0 vCPU**, **64 max processes (PIDs)**, air-gapped network (`--network none`), capability revocation (`CapDrop: ALL`), and a **5.0s watchdog timer** (SIGKILL on infinite loops).
- **Multi-Language Runtimes:** Full support for **Python 3.11**, **Java 17 (OpenJDK)**, **C++20 (GCC 12)**, and **JavaScript (Node.js 18 LTS)** with custom standard input (`stdin`) streaming.
- **Enterprise RBAC & Telemetry:** Role-based access control protecting admin endpoints and live Prometheus metrics (`http_requests_total`, `code_queue_depth`, `code_executions_total`, `code_execution_time_seconds`).

---

## 🚀 Quick Start (Local Run — 100% Free)

You can run the entire 6-tier platform (Postgres, Redis, API Gateway, Execution Worker, React Frontend, Prometheus, and Grafana) locally on your laptop with one command:

```bash
# Start all microservices locally
docker compose up --build
```

### Access URLs
| Service | URL | Default Credentials |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | — |
| **API Gateway** | [http://localhost:5000](http://localhost:5000) | — |
| **Prometheus Metrics** | [http://localhost:9090](http://localhost:9090) | — |
| **Grafana Dashboards** | [http://localhost:3001](http://localhost:3001) | User: `admin` / Pass: `admin` |

### Pre-Seeded Teacher / Evaluator Demo Accounts
- 👑 **Admin Account:** `admin@codenova.io` / `Admin@123` *(Full access to Admin Panel, user role management & telemetry)*
- 👤 **Student Account:** `manideep@codenova.io` / `User@123` *(Code authoring, custom stdin & submission history)*

*(Quick-fill buttons are built directly into the login screen for instant 1-click evaluation)*

---

## 🧪 Automated Testing Suite

Run the full automated test suite (Unit tests, Joi schemas, JWT verification, and Supertest integration tests):

```bash
cd backend
npm test
```

---

## ☁️ AWS Cloud Deployment (Demo Run)

All Terraform IaC modules and Kubernetes manifests are pre-configured:

### 1. Provision AWS Infrastructure via Terraform
```bash
cd terraform
terraform init
terraform apply -auto-approve
```

### 2. Deploy to Amazon EKS
```bash
make deploy
```

### 3. Teardown Immediately After Demo (Cost Optimization)
Once your evaluation is complete, run:
```bash
cd terraform
terraform destroy -auto-approve
```
*Running for 2–4 hours costs under **$0.50** (less than ₹40).*

---

## 📂 Project Directory Structure

```
├── backend/
│   ├── config/             # Database & environment configurations
│   ├── controllers/        # Auth, Submissions, Admin & Language controllers
│   ├── middleware/         # JWT Auth, RBAC guards & Joi payload validators
│   ├── migrations/         # PostgreSQL schema migrations
│   ├── models/             # Sequelize models (User, Role, Language, Submission, Result)
│   ├── routes/             # REST API routes (/auth, /submissions, /languages, /admin)
│   ├── seeders/            # Database seeders (Admin, demo users & 4 runtimes)
│   ├── services/           # ExecutionService (Dockerode sandbox) & QueueService (Bull)
│   ├── tests/              # Jest & Supertest test suites
│   ├── utils/              # Winston JSON logger & Prometheus metrics
│   ├── server.js           # Express API Gateway entrypoint
│   └── worker.js           # Asynchronous Code Execution Worker
├── frontend/
│   ├── src/pages/          # Landing, Editor (Monaco + stdin), History & Admin Dashboard
│   ├── src/context/        # AuthContext state management
│   └── src/api/            # Axios HTTP client
├── k8s/                    # Production Kubernetes manifests (Backend, Worker, Redis, Ingress)
├── terraform/              # AWS IaC (VPC, EKS, RDS PostgreSQL, ALB, S3, IAM)
├── docker-compose.yml      # Local 6-tier development orchestration
├── Jenkinsfile             # CI/CD pipeline definition
└── Makefile                # Build, test, and deployment automation
```
