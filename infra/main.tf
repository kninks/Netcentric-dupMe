provider "aws" {
  region = "us-west-2" # Choose your preferred region
}

resource "aws_s3_bucket" "react_app_bucket" {
  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "bucket_ownership" {
  bucket = aws_s3_bucket.react_app_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "react_app_bucket_block" {
  bucket = aws_s3_bucket.react_app_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  restrict_public_buckets = false
  ignore_public_acls      = false
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.react_app_bucket.id

  acl = "public-read"
  depends_on = [aws_s3_bucket_ownership_controls.bucket_ownership, aws_s3_bucket_public_access_block.react_app_bucket_block]
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.react_app_bucket.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal": "*",
        "Action" : "s3:GetObject",
        "Resource" : "${aws_s3_bucket.react_app_bucket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_acl.bucket_acl]
}

resource "aws_s3_bucket_object" "react_app" {
  for_each = fileset("../client/dist", "**")
  bucket   = aws_s3_bucket.react_app_bucket.bucket
  key      = each.value
  source   = "../client/dist/${each.value}"
}

output "s3_bucket_website_url" {
  value = aws_s3_bucket.react_app_bucket.website_endpoint
}