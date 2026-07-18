resource "aws_dynamodb_table" "catalog_table" {
  name           = "catalog-table"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "ProductID"

  attribute {
    name = "ProductID"
    type = "S"
  }

  attribute {
    name = "ProductCategory"
    type = "S"
  }

  global_secondary_index {
    name            = "CategoryIndex"
    hash_key        = "ProductCategory"
    projection_type = "ALL"
    read_capacity   = 5
    write_capacity  = 5
  }
}

resource "aws_dynamodb_table" "cart_table" {
  name           = "cart-table"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "UserID"
  range_key      = "ProductID"

  attribute {
    name = "UserID"
    type = "S"
  }

  attribute {
    name = "ProductID"
    type = "S"
  }
}
