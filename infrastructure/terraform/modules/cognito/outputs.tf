output "user_pool_id"{
    value = aws_cognito_user_pool.ecommerce_users.id
}

output "user_pool_client_id"{
    value = aws_cognito_user_pool_client.frontend.id
}