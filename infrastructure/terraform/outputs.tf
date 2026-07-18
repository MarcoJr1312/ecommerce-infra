output "alb_dns_name" {
  value = module.load_balancer.alb_dns_name
}

output "user_pool_id" {
  value = module.cognito.user_pool_id
}

output "user_pool_client_id" {
  value = module.cognito.user_pool_client_id
}

output "frontend_repo_url" {
  value = module.ecr.frontend_repo_url
}

output "catalog_repo_url" {
  value = module.ecr.catalog_repo_url
}

output "cart_repo_url" {
  value = module.ecr.cart_repo_url
}
