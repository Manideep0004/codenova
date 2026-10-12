resource "aws_ecr_repository" "backend" {
  name                 = "codenova-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "frontend" {
  name                 = "codenova-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

output "backend_repository_url" { value = aws_ecr_repository.backend.repository_url }
output "frontend_repository_url" { value = aws_ecr_repository.frontend.repository_url }
