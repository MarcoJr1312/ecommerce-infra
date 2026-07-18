resource "aws_ecr_repository" "frontend" {
  name         = "haven-frontend"
  force_delete = true

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "catalog" {
  name         = "haven-catalog-api"
  force_delete = true

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "cart" {
  name         = "haven-cart-api"
  force_delete = true

  tags = {
    Environment = var.environment
  }
}
