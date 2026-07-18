import os
import uuid
from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
import boto3

app = FastAPI()

table_name = os.getenv("TABLE_NAME", "catalog-table")
bucket_name = os.getenv("BUCKET_NAME", "dev-haven-product-images")
aws_region = os.getenv("AWS_REGION", "us-east-1")

dynamodb = boto3.resource("dynamodb", region_name=aws_region)
table = dynamodb.Table(table_name)
s3 = boto3.client("s3", region_name=aws_region)


def _to_product(item: dict) -> dict:
    key = item.get("ProductImage", "")
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": key},
        ExpiresIn=3600,
    ) if key else ""

    return {
        "id": item["ProductID"],
        "name": item["ProductName"],
        "price": int(float(item["ProductPrice"])),
        "category": item["ProductCategory"],
        "image": url,
    }


@app.get("/api/products")
def list_products(category: str = Query(None)):
    if category:
        response = table.query(
            IndexName="CategoryIndex",
            KeyConditionExpression="ProductCategory = :cat",
            ExpressionAttributeValues={":cat": category},
        )
    else:
        response = table.scan()

    return [_to_product(item) for item in response.get("Items", [])]


@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    response = table.get_item(Key={"ProductID": product_id})
    item = response.get("Item")
    if not item:
        return JSONResponse(status_code=404, content={"error": "not found"})
    return _to_product(item)


@app.get("/api/categories")
def list_categories():
    response = table.scan(ProjectionExpression="ProductCategory")
    categories = sorted(set(
        item["ProductCategory"] for item in response.get("Items", [])
    ))
    return categories


@app.post("/api/products")
async def create_product(
    name: str = Form(...),
    price: int = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...),
):
    product_id = str(uuid.uuid4())
    ext = os.path.splitext(image.filename or ".jpg")[1]
    s3_key = f"products/{product_id}{ext}"

    s3.upload_fileobj(
        image.file,
        bucket_name,
        s3_key,
        ExtraArgs={"ContentType": image.content_type or "image/jpeg"},
    )

    table.put_item(Item={
        "ProductID": product_id,
        "ProductName": name,
        "ProductPrice": price,
        "ProductCategory": category,
        "ProductImage": s3_key,
    })

    return _to_product({
        "ProductID": product_id,
        "ProductName": name,
        "ProductPrice": price,
        "ProductCategory": category,
        "ProductImage": s3_key,
    })
