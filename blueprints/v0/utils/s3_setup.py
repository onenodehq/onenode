import os
import boto3

s3_config = {
    "region_name": os.getenv("AWS_REGION"),
}

if os.getenv("SELF_HOSTED"):
    s3_config.update({
        "endpoint_url": os.getenv("S3_ENDPOINT_URL"),
        "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
        "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY"),
        "config": boto3.session.Config(signature_version="s3v4"),
    })

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
