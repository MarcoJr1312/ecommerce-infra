resource "aws_ecs_cluster" "ecommerce_cluster" {
  name = var.cluster_name
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend"
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "frontend"
    image     = var.frontend_image
    cpu       = 256
    memory    = 128
    essential = true

    portMappings = [{
      hostPort      = 0
      containerPort = 80
      protocol      = "tcp"
    }]
  }])
}

resource "aws_ecs_task_definition" "catalog" {
  family                   = "catalog"
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "catalog-api"
    image     = var.catalog_image
    cpu       = 256
    memory    = 128
    essential = true

    portMappings = [{
      hostPort      = 0
      containerPort = 80
      protocol      = "tcp"
    }]

    environment = [
      { name = "TABLE_NAME", value = var.catalog_table_name },
      { name = "BUCKET_NAME", value = var.bucket_name },
      { name = "AWS_REGION", value = "us-east-1" }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.catalog_service_name}"
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "cart" {
  family                   = "cart"
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "cart-api"
    image     = var.cart_image
    cpu       = 256
    memory    = 128
    essential = true

    portMappings = [{
      hostPort      = 0
      containerPort = 80
      protocol      = "tcp"
    }]

    environment = [
      { name = "TABLE_NAME", value = var.cart_table_name },
      { name = "CATALOG_TABLE_NAME", value = var.catalog_table_name },
      { name = "BUCKET_NAME", value = var.bucket_name },
      { name = "AWS_REGION", value = "us-east-1" }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.cart_service_name}"
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "frontend" {
  name            = var.frontend_service_name
  cluster         = aws_ecs_cluster.ecommerce_cluster.id
  task_definition = aws_ecs_task_definition.frontend.arn
  launch_type     = "EC2"
  desired_count   = 1

  load_balancer {
    target_group_arn = var.frontend_tg_arn
    container_name   = "frontend"
    container_port   = 80
  }
}

resource "aws_ecs_service" "catalog" {
  name            = var.catalog_service_name
  cluster         = aws_ecs_cluster.ecommerce_cluster.id
  task_definition = aws_ecs_task_definition.catalog.arn
  launch_type     = "EC2"
  desired_count   = 1

  load_balancer {
    target_group_arn = var.catalog_tg_arn
    container_name   = "catalog-api"
    container_port   = 80
  }
}

resource "aws_ecs_service" "cart" {
  name            = var.cart_service_name
  cluster         = aws_ecs_cluster.ecommerce_cluster.id
  task_definition = aws_ecs_task_definition.cart.arn
  launch_type     = "EC2"
  desired_count   = 1

  load_balancer {
    target_group_arn = var.cart_tg_arn
    container_name   = "cart-api"
    container_port   = 80
  }
}
