import os
import boto3

# Configure the S3 client
s3 = boto3.client(
    "s3",
    region_name=os.getenv("COGNITO_AWS_REGION"),
)

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")


# Define the MIME type extension map globally
EXTENSION_MAP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/x-icon": "ico",
    "image/heif": "heif",
    "image/heic": "heic",
    "image/avif": "avif",
}
