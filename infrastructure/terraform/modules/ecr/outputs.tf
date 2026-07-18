output "frontend_repo_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "catalog_repo_url" {
  value = aws_ecr_repository.catalog.repository_url
}

output "cart_repo_url" {
  value = aws_ecr_repository.cart.repository_url
}
