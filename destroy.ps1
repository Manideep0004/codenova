# CodeNova 1-Click Teardown Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Red
Write-Host "   CODENOVA: Destroying AWS Cloud Infrastructure...       " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

$WorkspaceRoot = $PSScriptRoot
$TerraformDir = Join-Path $WorkspaceRoot "terraform"

# Optional: Delete Kubernetes Services to immediately release AWS LoadBalancers
Write-Host "`n[Step 1/2] Releasing AWS LoadBalancers in Kubernetes..." -ForegroundColor Yellow
try {
    kubectl delete svc -n production frontend-service backend-service --timeout=30s
    kubectl delete svc -n monitoring grafana-service --timeout=30s
} catch {
    Write-Host "No active k8s services or cluster already unreachable." -ForegroundColor Gray
}

# Run Terraform Destroy
Write-Host "`n[Step 2/2] Running Terraform Destroy (this takes ~5-8 minutes)..." -ForegroundColor Yellow
Set-Location $TerraformDir
terraform destroy -auto-approve

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   ALL AWS RESOURCES DESTROYED! CREDITS ARE SAFE.         " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
