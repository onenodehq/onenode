import os
import boto3

# Check if running on localhost
if os.getenv("FLASK_RUN_HOST", "") == "localhost":
    # Use credentials for local development
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )
else:
    # Use IAM roles in production
    s3 = boto3.client(
        "s3",
        region_name=os.getenv("AWS_REGION"),
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

SIGNED_URL_EXPIRATION: int = int(os.getenv("SIGNED_URL_EXPIRATION"))
