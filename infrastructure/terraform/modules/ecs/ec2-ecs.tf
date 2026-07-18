data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended"
}

locals {
  ecs_ami_id = jsondecode(data.aws_ssm_parameter.ecs_ami.value)["image_id"]
}

resource "aws_iam_role" "ecs_instance_role" {
  name = "${var.environment}-ecs-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecs_instance_ecr_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ecs_instance" {
  name = "${var.environment}-ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
}

resource "aws_instance" "ecs_host" {
  ami                         = local.ecs_ami_id
  instance_type               = "t3.micro"
  subnet_id                   = var.public_subnet_a_id
  vpc_security_group_ids      = [aws_security_group.ecs_tasks.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ecs_instance.name

  user_data_replace_on_change = true

  user_data = <<-EOF
    #!/bin/bash
    echo "ECS_CLUSTER=${var.cluster_name}" > /etc/ecs/ecs.config
    echo "ECS_LOGLEVEL=debug" >> /etc/ecs/ecs.config
  EOF

  tags = {
    Name = "${var.environment}-ecs-host"
  }
}
