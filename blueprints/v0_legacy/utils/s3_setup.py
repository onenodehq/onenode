import os
import boto3

s3_config = {
    "region_name": os.getenv("AWS_REGION"),
}

s3 = boto3.client("s3", **s3_config)

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

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

SIGNED_URL_EXPIRATION: int = int(os.getenv("SIGNED_URL_EXPIRATION", 3600))
