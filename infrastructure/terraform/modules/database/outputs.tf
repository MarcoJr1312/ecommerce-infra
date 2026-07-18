output "catalog_table_name" {
  value = aws_dynamodb_table.catalog_table.name
}

output "catalog_table_arn" {
  value = aws_dynamodb_table.catalog_table.arn
}

output "cart_table_name" {
  value = aws_dynamodb_table.cart_table.name
}

output "cart_table_arn" {
  value = aws_dynamodb_table.cart_table.arn
}
