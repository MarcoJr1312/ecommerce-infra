terraform {
  required_providers {
    random = {
      source = "hashicorp/random"
    }
  }
}

resource "aws_cognito_user_pool" "ecommerce_users"{
    name = "${var.environment}-haven-users"
    auto_verified_attributes = ["email"]

    password_policy{
        minimum_length = 8
        require_numbers = true
    }

    account_recovery_setting{
        recovery_mechanism{
            name = "verified_email"
            priority = 1
        }
    }

    schema{
        name = "email"
        attribute_data_type = "String"
        required = true
        mutable = true
    }

    schema{
        name = "given_name"
        attribute_data_type = "String"
        required = true
        mutable = true
    }
}

resource "aws_cognito_user_pool_client" "frontend"{
    name = "${var.environment}-frontend-client"
    user_pool_id = aws_cognito_user_pool.ecommerce_users.id
    generate_secret = false

    explicit_auth_flows = [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_PASSWORD_AUTH"
    ]
}

resource "random_id" "domain_suffix" {
  keepers = {
    domain_prefix = "${var.environment}-haven"
  }
  byte_length = 4
}

resource "aws_cognito_user_pool_domain" "main"{
    domain = "${var.environment}-haven-${random_id.domain_suffix.hex}"
    user_pool_id = aws_cognito_user_pool.ecommerce_users.id
}