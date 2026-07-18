variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "frontend_service_name" {
  description = "Name of the frontend ECS service"
  type        = string
}

variable "catalog_service_name" {
  description = "Name of the catalog API ECS service"
  type        = string
}

variable "cart_service_name" {
  description = "Name of the cart API ECS service"
  type        = string
}

variable "frontend_image" {
  description = "Docker image URI for the frontend"
  type        = string
}

variable "catalog_image" {
  description = "Docker image URI for the catalog API"
  type        = string
}

variable "cart_image" {
  description = "Docker image URI for the cart API"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_id" {
  description = "Private subnet ID for ECS tasks"
  type        = string
}

variable "public_subnet_a_id" {
  description = "Public subnet ID for the EC2 instance"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "lb_sg_id" {
  description = "Load balancer security group ID"
  type        = string
}

variable "frontend_tg_arn" {
  description = "ALB target group ARN for frontend"
  type        = string
}

variable "catalog_tg_arn" {
  description = "ALB target group ARN for catalog API"
  type        = string
}

variable "cart_tg_arn" {
  description = "ALB target group ARN for cart API"
  type        = string
}

variable "catalog_table_name" {
  description = "DynamoDB catalog table name"
  type        = string
}

variable "catalog_table_arn" {
  description = "DynamoDB catalog table ARN"
  type        = string
}

variable "cart_table_arn" {
  description = "DynamoDB cart table ARN"
  type        = string
}

variable "cart_table_name" {
  description = "DynamoDB cart table name"
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name for product images"
  type        = string
}

variable "bucket_arn" {
  description = "S3 bucket ARN for product images"
  type        = string
}
