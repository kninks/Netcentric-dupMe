# --------------------------
# AWS Provider Configuration
# --------------------------
provider "aws" {
  region = "us-west-2"  # Specify the region
}

# ----------------------------
# S3 Bucket for React Web App
# ----------------------------
resource "aws_s3_bucket" "react_app_bucket" {
  # Configure the bucket to serve a static website
  website {
    index_document = "index.html"  # Entry point for the app
    error_document = "index.html"  # Error page fallback (SPA friendly)
  }

  # Optional: add any tags if needed
  tags = {
    Name = "ReactAppBucket"
    Environment = "Demo"
  }
}

# ---------------------------------
# Ownership Control for S3 Bucket
# ---------------------------------
resource "aws_s3_bucket_ownership_controls" "bucket_ownership" {
  bucket = aws_s3_bucket.react_app_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"  # Ensure bucket owner manages the objects
  }
}

# --------------------------------------------------
# Public Access Block Configuration for S3 Bucket
# --------------------------------------------------
resource "aws_s3_bucket_public_access_block" "react_app_bucket_block" {
  bucket = aws_s3_bucket.react_app_bucket.id

  # Control over the public access to the bucket
  block_public_acls       = false  # Allow public ACLs
  block_public_policy     = false  # Allow public bucket policies
  restrict_public_buckets = false  # Don't restrict public access
  ignore_public_acls      = false  # Don't ignore public ACLs
}

# --------------------------
# Bucket Access Control List
# --------------------------
resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.react_app_bucket.id

  acl = "public-read"  # Make the bucket publicly readable

  # Uncomment to define dependencies explicitly
  depends_on = [
    aws_s3_bucket_ownership_controls.bucket_ownership, 
    aws_s3_bucket_public_access_block.react_app_bucket_block
  ]
}

# -----------------------
# Bucket Policy for Access
# -----------------------
resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.react_app_bucket.id

  # Define a policy that allows public read access to all objects
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect"    : "Allow",
        "Principal" : "*",   # Allow everyone
        "Action"    : "s3:GetObject",
        "Resource"  : "${aws_s3_bucket.react_app_bucket.arn}/*"  # Access to all objects in the bucket
      }
    ]
  })

  depends_on = [aws_s3_bucket_acl.bucket_acl]  # Ensure ACL is set before applying the policy
}

# --------------------------------
# Upload React App Files to Bucket
# --------------------------------
resource "aws_s3_bucket_object" "react_app" {
  for_each = fileset("../client/dist", "**")  # Include all files from the React build directory
  bucket   = aws_s3_bucket.react_app_bucket.bucket
  key      = each.value  # Set S3 object key to the file path
  source   = "../client/dist/${each.value}"  # Upload from the local directory
}

# -----------------------------
# Output the Website URL
# -----------------------------
output "s3_bucket_website_url" {
  value = aws_s3_bucket.react_app_bucket.website_endpoint  # Display the S3 website URL
  description = "Access the React App via this URL"
}