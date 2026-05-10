/*
terraform {
  backend "s3" {
    bucket         = "codenova-tf-state-bucket"
    key            = "codenova/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "codenova-tf-lock-table"
    encrypt        = true
  }
}
*/
