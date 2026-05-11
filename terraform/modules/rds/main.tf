variable "vpc_id" {}
variable "subnet_ids" {}
variable "rds_security_group_id" {}
variable "db_password" {}

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "codenova-rds-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "postgres" {
  identifier             = "codenova-postgres"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = "codenova_prod"
  username               = "dbadmin"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [var.rds_security_group_id]
  skip_final_snapshot    = true
  multi_az               = false
}

output "db_instance_endpoint" { value = aws_db_instance.postgres.endpoint }
