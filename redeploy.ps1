# CodeNova 1-Click Automated Redeployment Script
# Region: ap-southeast-2 (Sydney)
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CODENOVA: Automated Full Stack Redeployment on AWS    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
$TerraformDir = Join-Path $WorkspaceRoot "terraform"
$AwsRegion = "ap-southeast-2"
$AccountId = "427282815124"
$EcrRegistry = "$AccountId.dkr.ecr.$AwsRegion.amazonaws.com"

# 1. Terraform Apply
Write-Host "`n[Step 1/7] Provisioning AWS Infrastructure with Terraform..." -ForegroundColor Yellow
Set-Location $TerraformDir
terraform apply -auto-approve
if ($LASTEXITCODE -ne 0) { throw "Terraform apply failed!" }

# 2. Extract Outputs
Write-Host "`n[Step 2/7] Retrieving Infrastructure Endpoints..." -ForegroundColor Yellow
$rdsEndpoint = (terraform output -raw rds_endpoint).Trim()
$rdsHost = ($rdsEndpoint -split ':')[0]
Write-Host "RDS Host: $rdsHost" -ForegroundColor Green

# 3. Update Kubernetes ConfigMap
Write-Host "`n[Step 3/7] Updating k8s ConfigMap with RDS Host..." -ForegroundColor Yellow
Set-Location $WorkspaceRoot
$configMapPath = Join-Path $WorkspaceRoot "k8s\configmap.yaml"
(Get-Content $configMapPath) -replace 'DB_HOST: ".*"', "DB_HOST: `"$rdsHost`"" | Set-Content $configMapPath

# 4. Authenticate & Configure Kubectl
Write-Host "`n[Step 4/7] Updating kubeconfig for EKS Cluster..." -ForegroundColor Yellow
aws eks update-kubeconfig --region $AwsRegion --name codenova-cluster

# 5. Build and Push Docker Images to ECR
Write-Host "`n[Step 5/7] Authenticating with ECR & Pushing Docker Images..." -ForegroundColor Yellow
aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $EcrRegistry

Write-Host "Building and pushing backend image..." -ForegroundColor Gray
docker build -t "$EcrRegistry/codenova-backend:latest" ./backend
docker push "$EcrRegistry/codenova-backend:latest"

Write-Host "Building and pushing frontend image..." -ForegroundColor Gray
docker build -t "$EcrRegistry/codenova-frontend:latest" ./frontend
docker push "$EcrRegistry/codenova-frontend:latest"

# 6. Apply Kubernetes Manifests
Write-Host "`n[Step 6/7] Deploying Workloads to Kubernetes..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/redis/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/worker/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/prometheus/
kubectl apply -f k8s/grafana/

# 7. Wait for Backend & Run DB Migrations + Seeders
Write-Host "`n[Step 7/7] Waiting for backend pod to be ready & initializing DB..." -ForegroundColor Yellow
kubectl rollout status deploy/codenova-backend -n production --timeout=180s

Write-Host "Running PostgreSQL database migrations..." -ForegroundColor Gray
kubectl exec -n production deploy/codenova-backend -c backend -- npx sequelize-cli db:migrate

Write-Host "Running database seeders (Roles, Users, Languages)..." -ForegroundColor Gray
kubectl exec -n production deploy/codenova-backend -c backend -- npx sequelize-cli db:seed:all

# Pre-cache runtimes in DinD
Write-Host "Pre-caching sandbox runtimes (Python, Node, Java)..." -ForegroundColor Gray
kubectl exec -n production deploy/codenova-backend -c dind -- docker pull python:3.11-slim
kubectl exec -n production deploy/codenova-backend -c dind -- docker pull node:18-alpine

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   CODENOVA PLATFORM SUCCESSFULLY REDEPLOYED LIVE!        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

Write-Host "`nRetrieving Public LoadBalancer URLs:" -ForegroundColor Cyan
kubectl get svc -n production frontend-service
kubectl get svc -n monitoring grafana-service
