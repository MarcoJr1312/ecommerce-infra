variable "public_subnet_a_cidr"{
    type = string
    default = "10.0.1.0/24"
}

variable "public_subnet_b_cidr"{
    type = string
    default = "10.0.3.0/24"
}

variable "private_subnet_cidr"{
    type = string
    default = "10.0.2.0/24"
}

variable "environment"{
    type = string
    default = "dev"
}

variable "vpc_id" {
  type = string
}