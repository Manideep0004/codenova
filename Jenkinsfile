pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '470745673259'
        ECR_BACKEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/codenova-backend"
        ECR_FRONTEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/codenova-frontend"
        DOMAIN = "codenova.nip.io"
        EMAIL_TO = "manideepgudiya2004@gmail.com"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                }
                dir('frontend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat "docker build -t codenova-backend:${GIT_COMMIT} ./backend"
                bat "docker build -t codenova-frontend:${GIT_COMMIT} ./frontend"
            }
        }

        stage('Push to ECR') {
            steps {
                bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                
                bat "docker tag codenova-backend:${GIT_COMMIT} ${ECR_BACKEND}:${GIT_COMMIT}"
                bat "docker tag codenova-backend:${GIT_COMMIT} ${ECR_BACKEND}:latest"
                bat "docker push ${ECR_BACKEND}:${GIT_COMMIT}"
                bat "docker push ${ECR_BACKEND}:latest"

                bat "docker tag codenova-frontend:${GIT_COMMIT} ${ECR_FRONTEND}:${GIT_COMMIT}"
                bat "docker tag codenova-frontend:${GIT_COMMIT} ${ECR_FRONTEND}:latest"
                bat "docker push ${ECR_FRONTEND}:${GIT_COMMIT}"
                bat "docker push ${ECR_FRONTEND}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat "kubectl set image deployment/codenova-backend backend=${ECR_BACKEND}:${GIT_COMMIT} -n production"
                bat "kubectl set image deployment/codenova-frontend frontend=${ECR_FRONTEND}:${GIT_COMMIT} -n production"
                
                bat "kubectl rollout status deployment/codenova-backend -n production"
                bat "kubectl rollout status deployment/codenova-frontend -n production"
            }
        }

        stage('Smoke Test') {
            steps {
                sleep 10
                bat """
                    curl -f http://${DOMAIN}/api/languages || exit /b 1
                """
            }
        }
    }

    post {
        success {
            mail to: "${EMAIL_TO}",
                 subject: "SUCCESS: Codenova Pipeline [${env.BUILD_NUMBER}]",
                 body: "Good news! The pipeline successfully built and deployed commit ${GIT_COMMIT}."
        }
        failure {
            mail to: "${EMAIL_TO}",
                 subject: "FAILURE: Codenova Pipeline [${env.BUILD_NUMBER}]",
                 body: "Pipeline failed on commit ${GIT_COMMIT}. Please check Jenkins logs at ${env.BUILD_URL}"
        }
    }
}
