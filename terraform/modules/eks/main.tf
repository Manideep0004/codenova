variable "vpc_id" {}
variable "subnet_ids" {}
variable "eks_cluster_role_arn" {}
variable "eks_node_role_arn" {}
variable "eks_security_group_id" {}

resource "aws_eks_cluster" "codenova" {
  name     = "codenova-cluster"
  role_arn = var.eks_cluster_role_arn

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.eks_security_group_id]
  }
}

resource "aws_eks_node_group" "codenova_nodes" {
  cluster_name    = aws_eks_cluster.codenova.name
  node_group_name = "codenova-node-group"
  node_role_arn   = var.eks_node_role_arn
  subnet_ids      = var.subnet_ids
  instance_types  = ["t3.medium"]

  scaling_config {
    desired_size = 2
    max_size     = 5
    min_size     = 2
  }
}

output "cluster_endpoint" { value = aws_eks_cluster.codenova.endpoint }
output "cluster_name" { value = aws_eks_cluster.codenova.name }
