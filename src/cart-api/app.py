import os
from fastapi import FastAPI, HTTPException
from fastapi.requests import Request
from fastapi.responses import JSONResponse
import boto3

app = FastAPI()

cart_table_name = os.getenv("TABLE_NAME", "cart-table")
catalog_table_name = os.getenv("CATALOG_TABLE_NAME", "catalog-table")
bucket_name = os.getenv("BUCKET_NAME", "dev-haven-product-images")
aws_region = os.getenv("AWS_REGION", "us-east-1")

dynamodb = boto3.resource("dynamodb", region_name=aws_region)
cart_table = dynamodb.Table(cart_table_name)
catalog_table = dynamodb.Table(catalog_table_name)

s3 = boto3.client("s3", region_name=aws_region)


def _signed_url(s3_key: str) -> str:
    if not s3_key:
        return ""
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": s3_key},
        ExpiresIn=3600,
    )


def _enrich(items: list) -> list:
    result = []
    for item in items:
        prod = catalog_table.get_item(Key={"ProductID": item["ProductID"]}).get("Item")
        result.append({
            "userId": item["UserID"],
            "productId": item["ProductID"],
            "quantity": int(item["Quantity"]),
            "name": prod["ProductName"] if prod else "Unknown",
            "price": int(float(item.get("ProductPrice", 0))),
            "image": _signed_url(prod["ProductImage"]) if prod else "",
        })
    return result


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/cart/{user_id}")
def get_cart(user_id: str):
    response = cart_table.query(
        KeyConditionExpression="UserID = :uid",
        ExpressionAttributeValues={":uid": user_id},
    )
    return _enrich(response.get("Items", []))


@app.post("/cart")
async def add_to_cart(request: Request):
    body = await request.json()
    user_id = body.get("userId")
    product_id = body.get("productId")
    quantity = body.get("quantity", 1)

    if not user_id or not product_id:
        raise HTTPException(400, "userId and productId are required")

    prod = catalog_table.get_item(Key={"ProductID": product_id}).get("Item")
    if not prod:
        raise HTTPException(404, f"Product {product_id} not found")

    cart_table.put_item(Item={
        "UserID": user_id,
        "ProductID": product_id,
        "Quantity": quantity,
        "ProductPrice": int(prod["ProductPrice"]),
    })

    return _enrich([{
        "UserID": user_id,
        "ProductID": product_id,
        "Quantity": quantity,
        "ProductPrice": int(prod["ProductPrice"]),  
    }])[0]


@app.delete("/cart/{user_id}/{product_id}")
def remove_item(user_id: str, product_id: str):
    cart_table.delete_item(
        Key={"UserID": user_id, "ProductID": product_id},
    )
    return {"status": "deleted"}


@app.delete("/cart/{user_id}")
def clear_cart(user_id: str):
    response = cart_table.query(
        KeyConditionExpression="UserID = :uid",
        ExpressionAttributeValues={":uid": user_id},
        ProjectionExpression="UserID,ProductID",
    )
    items = response.get("Items", [])
    with cart_table.batch_writer() as batch:
        for item in items:
            batch.delete_item(Key=item)
    return {"status": "cleared", "removed": len(items)}
