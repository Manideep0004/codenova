variable "region" {
  description = "AWS Region"
  type        = string
  default     = "ap-south-1"
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
  default     = "470745673259"
}

variable "db_password" {
  description = "Password for RDS PostgreSQL"
  type        = string
  sensitive   = true
}

variable "key_pair_name" {
  description = "Key pair name for EC2 instances"
  type        = string
  default     = "codenova-key"
}
