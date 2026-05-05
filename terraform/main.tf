provider "aws" {
  region = var.region
}

module "vpc" {
  source = "./modules/vpc"
}

module "security_groups" {
  source = "./modules/security_groups"
  vpc_id = module.vpc.vpc_id
}

module "iam" {
  source = "./modules/iam"
}

module "eks" {
  source                  = "./modules/eks"
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnets
  eks_cluster_role_arn    = module.iam.eks_cluster_role_arn
  eks_node_role_arn       = module.iam.eks_node_role_arn
  eks_security_group_id   = module.security_groups.eks_cluster_sg_id
}

module "rds" {
  source                = "./modules/rds"
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnets
  rds_security_group_id = module.security_groups.rds_sg_id
  db_password           = var.db_password
}

module "ecr" {
  source = "./modules/ecr"
}

module "s3" {
  source      = "./modules/s3"
  bucket_name = "codenova-frontend-hosting-${var.account_id}"
}
