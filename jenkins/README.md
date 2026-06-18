# Jenkins Setup Guide — Codenova

## Prerequisites

Make sure these are installed and working on your Windows machine before starting:

| Tool | Check command | Required for |
|------|---------------|--------------|
| Docker Desktop | `docker version` | Running Jenkins + building images |
| AWS CLI | `aws sts get-caller-identity` | ECR push + EKS deploy |
| kubectl | `kubectl version --client` | K8s deployment |
| Git | `git version` | Source checkout |

> **AWS credentials** — Run `aws configure` once on your Windows host.  
> The docker-compose file mounts `~/.aws` read-only into Jenkins so it inherits them automatically.

> **kubectl** — Run `aws eks update-kubeconfig --region ap-south-1 --name codenova-cluster` once on your Windows host.  
> The `~/.kube` directory is also mounted read-only into Jenkins.

---

## Step 1 — Start Jenkins

Open a PowerShell terminal in the project root and run:

```powershell
cd "d:\Crazy-Shit\Code Execution Platform\jenkins"
docker compose -f docker-compose.jenkins.yml up -d --build
```

This will:
1. Build the custom Jenkins image (with AWS CLI, kubectl, Docker CLI, Node.js 18)
2. Start Jenkins on **http://localhost:8080**
3. Mount your local Docker socket, AWS credentials, and kubeconfig into Jenkins

> First build takes ~5-10 minutes (downloading base image + plugins). Subsequent starts are instant.

---

## Step 2 — Unlock Jenkins

Get the initial admin password:

```powershell
docker exec jenkins-codenova cat /var/jenkins_home/secrets/initialAdminPassword
```

Open **http://localhost:8080**, paste the password, and click **Continue**.

---

## Step 3 — Complete Setup Wizard

- Click **"Install suggested plugins"** (plugins from `plugins.txt` are already baked into the image, this just ensures UI plugins are in sync)
- Create your admin user account
- Set Jenkins URL to `http://localhost:8080` → **Save and Finish**

---

## Step 4 — Add GitHub Credentials

1. Go to **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**
2. Fill in:
   - **Kind**: Username with password
   - **Username**: `Manideep0004`
   - **Password**: Your GitHub Personal Access Token ([create one here](https://github.com/settings/tokens) with `repo` scope)
   - **ID**: `github-credentials`
   - **Description**: GitHub PAT for Codenova
3. Click **Create**

---

## Step 5 — Create the Pipeline Job

1. Click **New Item** on the Jenkins dashboard
2. Enter name: `codenova-pipeline`
3. Select **Multibranch Pipeline** → **OK**
4. Under **Branch Sources** → **Add source** → **GitHub**:
   - Credentials: select `github-credentials`
   - Repository HTTPS URL: `https://github.com/Manideep0004/codenova` (your repo URL)
5. Under **Build Configuration**:
   - Mode: `by Jenkinsfile`
   - Script Path: `Jenkinsfile` (default)
6. Click **Save**

Jenkins will automatically scan your repository and detect the `Jenkinsfile`.

---

## Step 6 — Trigger the Pipeline

Jenkins will auto-trigger a build on scan. You can also manually trigger:
- Click on your branch (e.g., `main`) → **Build Now**

Watch the stages in **Blue Ocean** view: **Open Blue Ocean** in the left sidebar.

---

## Verifying Each Stage

| Stage | What to check |
|-------|--------------|
| **Checkout** | Repo cloned without auth errors |
| **Install Dependencies** | `npm ci` runs for both `backend/` and `frontend/` |
| **Run Tests** | Jest passes — `2 tests passed` |
| **Build Docker Images** | Both `codenova-backend:GIT_COMMIT` and `codenova-frontend:GIT_COMMIT` built |
| **Push to ECR** | Images appear in AWS ECR console under `codenova-backend` and `codenova-frontend` |
| **Deploy to K8s** | `kubectl rollout status` exits 0 |
| **Smoke Test** | `GET http://codenova.nip.io/api/languages` returns 200 |

---

## Stopping Jenkins

```powershell
cd "d:\Crazy-Shit\Code Execution Platform\jenkins"
docker compose -f docker-compose.jenkins.yml down
```

Jenkins home is persisted in the `codenova_jenkins_home` Docker volume — all jobs, configs, and build history survive restarts.

To fully wipe and start fresh:

```powershell
docker compose -f docker-compose.jenkins.yml down -v
```

---

## Troubleshooting

### `permission denied` on `/var/run/docker.sock`
The Jenkins container's `jenkins` user must be in the `docker` group. The `Dockerfile.jenkins` handles this, but if it persists:
```powershell
docker exec -u root jenkins-codenova chmod 666 /var/run/docker.sock
```

### AWS CLI says `Unable to locate credentials`
Make sure you've run `aws configure` on your Windows host **before** starting Jenkins. The `~/.aws` mount is read-only from the host.  
Verify: `docker exec jenkins-codenova aws sts get-caller-identity`

### `kubectl: command not found` or wrong cluster
Verify the kubeconfig was mounted correctly:
```powershell
docker exec jenkins-codenova kubectl config current-context
```
Expected: your EKS cluster context. If wrong, re-run on Windows host:
```powershell
aws eks update-kubeconfig --region ap-south-1 --name codenova-cluster
```
Then restart Jenkins so it picks up the updated `~/.kube`.
