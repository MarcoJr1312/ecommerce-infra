resource "aws_s3_bucket" "product_images"{
    bucket = "${var.environment}-haven-product-images"
}

resource "aws_s3_bucket_public_access_block" "product_images"{
    bucket = aws_s3_bucket.product_images.id
    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}
