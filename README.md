# Haven — E-Commerce Platform

A three-service e-commerce platform deployed on AWS ECS (EC2 launch type, bridge network mode) using Terraform. Built with a React + Vite frontend, two FastAPI microservices, DynamoDB, S3, and Cognito.

---

## Architecture

```
                         ┌─────────────────┐
                         │  ALB DNS Name   │
                         │  (AWS-assigned) │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │       ALB       │
                         │  (port 80/443)  │
                         └──┬────┬────┬────┘
                            │    │    │
              ┌─────────────┘    │    └─────────────┐
              │                  │                  │
     ┌────────▼────────┐ ┌──────▼────────┐ ┌───────▼────────┐
     │   Frontend      │ │  Catalog API  │ │   Cart API     │
     │  (React/Vite)   │ │  (FastAPI)    │ │  (FastAPI)     │
     │  ─────────────  │ │  ──────────   │ │  ──────────    │
     │  Nginx :80      │ │  Uvicorn :80  │ │  Uvicorn :80   │
     └────────┬────────┘ └──────┬────────┘ └───────┬────────┘
              │                 │                   │
              │          ┌──────▼───────┐    ┌──────▼───────┐
              │          │   DynamoDB   │    │   DynamoDB   │
              │          │ catalog-table│    │  cart-table  │
              │          └──────────────┘    └──────────────┘
              │
        ┌─────▼──────┐
        │  Cognito   │
        │ User Pool  │
        └────────────┘
```

All three services run as ECS tasks on a single EC2 (`t3.micro`) instance using **bridge** network mode, fronted by an internet-facing Application Load Balancer.

---

## Services

| Service | Stack | Port | Description |
|---|---|---|---|
| **Frontend** | React + Vite → Nginx | 80 | Single-page app with Cognito authentication |
| **Catalog API** | Python FastAPI + Uvicorn | 80 | Products and categories API backed by DynamoDB |
| **Cart API** | Python FastAPI + Uvicorn | 80 | Shopping cart CRUD API backed by DynamoDB |

---

## Project Structure

```
ecommerce_infra/
├── src/
│   ├── frontend/            # React + Vite SPA
│   │   ├── components/      # UI components (AuthModal, etc.)
│   │   ├── hooks/           # React hooks (useAuth, etc.)
│   │   ├── utils/           # Cognito helper
│   │   ├── Dockerfile
│   │   package.json
│   │   vite.config.js
│   |   ...
│   ├── catalog-api/         # Products & categories API
│   │   ├── app.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── cart-api/            # Shopping cart API
│       ├── app.py
│       ├── Dockerfile
│       └── requirements.txt
│
└── infrastructure/
    └── terraform/
        ├── main.tf           # Root module wiring
        ├── variables.tf
        ├── outputs.tf
        ├── provider.tf
        └── modules/
            ├── vpc/                    # VPC (10.0.0.0/16)
            ├── subnets/                # 2 public + 1 private subnet
            ├── networking/
            │   ├── internet-gateway/   # IGW attachment
            │   ├── route-table/        # Public/private routing
            │   └── load-balancer/      # ALB, target groups, listeners
            ├── ecs/                    # Cluster, task defs, services, EC2,  IAM roles, SGs (files only)
            ├── ecr/                    # 3 ECR repositories
            ├── database/               # DynamoDB tables (catalog + cart)
            ├── s3/                     # Product images bucket
            └── cognito/                # Cognito user pool + client
```

---

## Terraform Modules

| Module | Purpose |
|---|---|
| `vpc` | VPC with CIDR `10.0.0.0/16` |
| `subnets` | 2 public subnets (us-east-1a/b) + 1 private subnet (us-east-1a) |
| `networking/internet-gateway` | Internet Gateway attached to VPC |
| `networking/route-table` | Public route table (0.0.0.0/0 → IGW) + private route table |
| `networking/load-balancer` | Internet-facing ALB, 3 target groups (instance), HTTP listeners |
| `ecs` | ECS cluster (EC2), 3 task definitions (bridge mode), 3 services, EC2 instance, IAM roles, security group |
| `ecr` | 3 ECR repositories: `haven-frontend`, `haven-catalog-api`, `haven-cart-api` |
| `database` | DynamoDB `catalog-table` (ProductID + GSI on Category) + `cart-table` (UserID + ProductID) |
| `s3` | Private S3 bucket `{env}-haven-product-images` |
| `cognito` | Cognito user pool with email verification, SRP auth, custom domain |

---

## API Endpoints

### Catalog API (`/api`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/category/{category}` | List products by category |
| GET | `/api/categories` | List all categories |

### Cart API (`/api`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/cart/{user_id}` | Get user's cart |
| POST | `/api/cart/{user_id}` | Add item to cart |
| PUT | `/api/cart/{user_id}/{product_id}` | Update cart item quantity |
| DELETE | `/api/cart/{user_id}/{product_id}` | Remove item from cart |

---

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.6
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) >= 20

---

## Deployment

### 1. Provision infrastructure

```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### 2. Authenticate Docker to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### 3. Build and push service images

```bash
# Catalog API
cd src/catalog-api
docker build -t haven-catalog-api .
docker tag haven-catalog-api:latest <catalog_repo_url>:latest
docker push <catalog_repo_url>:latest

# Cart API
cd ../cart-api
docker build -t haven-cart-api .
docker tag haven-cart-api:latest <cart_repo_url>:latest
docker push <cart_repo_url>:latest
```

### 4. Get Terraform outputs

```bash
cd infrastructure/terraform
terraform output
```

Note the values for `alb_dns_name`, `user_pool_id`, `user_pool_client_id`, and the ECR repo URLs.

### 5. Build and push frontend with Cognito config

```bash
cd src/frontend
docker build \
  --build-arg VITE_COGNITO_USER_POOL_ID=<user_pool_id> \
  --build-arg VITE_COGNITO_CLIENT_ID=<user_pool_client_id> \
  --build-arg VITE_CATALOG_API_URL=http://<alb_dns_name>/api \
  -t haven-frontend .
docker tag haven-frontend:latest <frontend_repo_url>:latest
docker push <frontend_repo_url>:latest
```

### 6. Force ECS service redeployments

```bash
aws ecs update-service --cluster ecommerce-cluster --service frontend --force-new-deployment
aws ecs update-service --cluster ecommerce-cluster --service catalog-api --force-new-deployment
aws ecs update-service --cluster ecommerce-cluster --service cart-api --force-new-deployment
```

The application will be available at `http://<alb_dns_name>`.

---

## Cost Estimate (Approximate)

| Resource | Monthly Cost |
|---|---|
| ALB | ~$16.43 |
| EC2 t3.micro (1 instance) | Free tier eligible |
| ECR storage (3 repos) | ~$0.50 |
| DynamoDB (on-demand, light use) | ~$1–2 |
| S3 (small, private) | ~$0.50 |
| Cognito (50k MAUs free) | Free |
| **Total** | **~$19–22/mo** |

> The ALB is the dominant cost (~$16/mo) and is not covered by the AWS Free Tier.

---

## Cleanup

To tear down all resources:

```bash
cd infrastructure/terraform
terraform destroy
```

This will remove all AWS resources provisioned by this project.

---

## Notes

- All three services use **bridge** network mode with `hostPort = 0` (dynamic host port mapping) and ALB target type `instance`.
- The EC2 instance runs the ECS-optimized Amazon Linux 2 AMI and is automatically registered with the cluster via the `AmazonEC2ContainerServiceforEC2Role` IAM policy.
- The frontend is a single-page application served by Nginx; API requests are proxied through the ALB to the backend services.
