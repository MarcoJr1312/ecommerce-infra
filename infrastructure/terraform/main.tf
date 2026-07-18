module "vpc" {
  source       = "./modules/vpc"
  vpc_tag_name = "ecommerce-vpc"
}

module "subnets" {
  source               = "./modules/subnets"
  vpc_id               = module.vpc.vpc_id
  public_subnet_a_cidr = "10.0.1.0/24"
  public_subnet_b_cidr = "10.0.3.0/24"
  private_subnet_cidr  = "10.0.2.0/24"
  environment          = "dev"
}

module "igw" {
  source      = "./modules/networking/internet-gateway"
  vpc_id      = module.vpc.vpc_id
  environment = "dev"
}

module "route_table" {
  source            = "./modules/networking/route-table"
  vpc_id            = module.vpc.vpc_id
  igw_id            = module.igw.igw_id
  public_subnet_id    = module.subnets.public_subnet_a_id
  public_subnet_b_id  = module.subnets.public_subnet_b_id
  private_subnet_id   = module.subnets.private_subnet_id
}

module "load_balancer" {
  source             = "./modules/networking/load-balancer"
  vpc_id             = module.vpc.vpc_id
  public_subnet_a_id = module.subnets.public_subnet_a_id
  public_subnet_b_id = module.subnets.public_subnet_b_id
  environment        = "dev"
}

module "database" {
  source = "./modules/database"
}

module "s3" {
  source      = "./modules/s3"
  environment = "dev"
}

module "cognito" {
  source      = "./modules/cognito"
  environment = "dev"
}

module "ecr" {
  source      = "./modules/ecr"
  environment = "dev"
}

module "ecs" {
  source               = "./modules/ecs"
  cluster_name         = "ecommerce-cluster"
  frontend_service_name = "frontend"
  catalog_service_name  = "catalog-api"
  cart_service_name     = "cart-api"
  frontend_image       = "${module.ecr.frontend_repo_url}:latest"
  catalog_image        = "${module.ecr.catalog_repo_url}:latest"
  cart_image           = "${module.ecr.cart_repo_url}:latest"
  vpc_id               = module.vpc.vpc_id
  private_subnet_id    = module.subnets.private_subnet_id
  public_subnet_a_id   = module.subnets.public_subnet_a_id
  environment          = "dev"
  lb_sg_id             = module.load_balancer.lb_sg_id
  frontend_tg_arn      = module.load_balancer.frontend_tg_arn
  catalog_tg_arn       = module.load_balancer.catalog_tg_arn
  cart_tg_arn          = module.load_balancer.cart_tg_arn
  catalog_table_name   = module.database.catalog_table_name
  catalog_table_arn    = module.database.catalog_table_arn
  cart_table_arn       = module.database.cart_table_arn
  cart_table_name      = module.database.cart_table_name
  bucket_name          = module.s3.bucket_name
  bucket_arn           = module.s3.bucket_arn
  depends_on           = [module.load_balancer, module.database, module.s3]
}
