import base64
import io
import logging
import os
import datetime
import json
import boto3
from typing import Dict, List
from botocore.signers import CloudFrontSigner
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from blueprints.v0.utils.openai_operations import image_to_text
from blueprints.v0.utils.s3_setup import (
    EXTENSION_MAP,
    S3_BUCKET_NAME,
    SIGNED_URL_EXPIRATION,
    s3,
)
from utils.email import notify_admin


def process_image_resources(
    resources: List[Dict], ids: List[str], user_id: str
) -> List[Dict]:
    updated_resources = []

    for i, resource in enumerate(resources):
        try:
            metadata = resource.get("metadata", {})
            mime_type = metadata.get("type")
            if not mime_type:
                raise ValueError("Missing MIME type for image")
            if mime_type.startswith("image/"):
                base64_image: str = resource.get("content")
                if not base64_image or not isinstance(base64_image, str):
                    raise ValueError("Content for image must be a base64 string")

                content = image_to_text(base64_image)
                extension = EXTENSION_MAP.get(mime_type, "bin")
                filename = f"{user_id}/{ids[i]}.{extension}"
                save_base64_image_legacy(base64_image=base64_image, filename=filename)

                metadata["s3_key"] = filename
                resource["metadata"] = metadata
                resource["content"] = content

            updated_resources.append(resource)

        except Exception as e:
            logging.error(f"Error processing image resource: {e}")
            raise RuntimeError(f"Failed to process resource content: {str(e)}")

    return updated_resources


def save_base64_image_legacy(base64_image, filename):
    try:
        # Check if the base64 string has metadata and extract content type if available
        if base64_image.startswith("data:"):
            header, base64_image = base64_image.split(",", 1)
            content_type = header.split(";")[0].split(":")[1]
        else:
            content_type = (
                "application/octet-stream"  # Default content type if not specified
            )

        # Decode the base64 string
        binary_image = base64.b64decode(base64_image)
        file_binary = io.BytesIO(binary_image)

        # Upload to S3
        upload_to_s3_legacy(file_binary, filename, content_type)

    except (base64.binascii.Error, ValueError) as e:
        logging.error(f"Failed to process base64 image: {e}")
        raise RuntimeError(f"Failed to save image to S3: {str(e)}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise RuntimeError(f"Failed to save image to S3: {str(e)}")


def upload_to_s3_legacy(file_binary, filename, content_type):
    s3.upload_fileobj(
        file_binary,
        S3_BUCKET_NAME,
        filename,
        ExtraArgs={"ContentType": content_type, "ACL": "public-read"},
    )


# legacy function
def upload_to_s3(base64_image: str, mime_type: str, filename: str, namespace: str):
    keyname = namespace + "/" + filename
    binary_image = base64.b64decode(base64_image)
    file_binary = io.BytesIO(binary_image)
    s3.upload_fileobj(
        file_binary,
        S3_BUCKET_NAME,
        keyname,
        ExtraArgs={"ContentType": mime_type, "ACL": "public-read"},
    )


def save_to_s3(base64_image: str, object_key: str, mime_type: str):
    binary_image = base64.b64decode(base64_image)
    file_binary = io.BytesIO(binary_image)
    s3.upload_fileobj(
        file_binary,
        S3_BUCKET_NAME,
        object_key,
        ExtraArgs={"ContentType": mime_type, "ACL": "public-read"},
    )


def retrieve_from_s3(object_key: str) -> tuple[str, str]:
    response = s3.get_object(Bucket=S3_BUCKET_NAME, Key=object_key)
    data = response["Body"].read()  # data is of type bytes
    # Base64 encode the bytes and decode to a UTF-8 string
    encoded_data = base64.b64encode(data).decode("utf-8")
    return encoded_data, response["ContentType"]


def generate_object_key(
    project_id: str,
    database_name: str,
    collection_name: str,
    doc_id: str,
    path: str,
    mime_type: str,
) -> str:
    mime_to_extension = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/bmp": "bmp",
        "image/tiff": "tiff",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "image/heif": "heif",
        "image/x-icon": "ico",
    }
    extension = mime_to_extension.get(mime_type, mime_type)
    normalized_path = path.replace(".", "/")

    return f"{project_id}/{database_name}/{collection_name}/{doc_id}/{normalized_path}/image.{extension}"


def generate_object_key_prefix(
    project_id: str,
    database_name: str,
    collection_name: str,
    doc_id: str = None,
    path: str = None,
) -> str:
    if doc_id:
        if path:
            normalized_path = path.replace(".", "/")
            return f"{project_id}/{database_name}/{collection_name}/{doc_id}/{normalized_path}/"
        else:
            return f"{project_id}/{database_name}/{collection_name}/{doc_id}/"
    else:
        return f"{project_id}/{database_name}/{collection_name}/"


def delete_s3_objects(object_keys: List[str]):
    """Delete objects from an S3 bucket.

    :param object_keys: List of keys of the objects to delete.
    """
    try:
        objects = [{"Key": key} for key in object_keys]
        response = s3.delete_objects(Bucket=S3_BUCKET_NAME, Delete={"Objects": objects})
        print("response\n", response)
        return response
    except Exception as e:
        logging.error(f"Failed to delete objects: {e}")
        raise RuntimeError(f"Failed to delete objects from S3: {str(e)}")


def delete_s3_objects_with_doc_ids(
    project_id: str, db_name: str, collection_name: str, doc_ids: List[str]
):
    for doc_id in doc_ids:
        prefix = generate_object_key_prefix(
            project_id, db_name, collection_name, doc_id
        )
        delete_s3_objects_with_prefix(object_key_prefix=prefix)


def delete_s3_objects_with_prefix(object_key_prefix: str) -> None:
    paginator = s3.get_paginator("list_objects_v2")
    objects_to_delete = []

    # Use pagination to process all objects with the given object_key_prefix.
    for page in paginator.paginate(Bucket=S3_BUCKET_NAME, Prefix=object_key_prefix):
        for obj in page.get("Contents", []):
            objects_to_delete.append({"Key": obj["Key"]})

            # S3 allows deletion of up to 1000 objects per delete_objects call.
            if len(objects_to_delete) == 1000:
                s3.delete_objects(
                    Bucket=S3_BUCKET_NAME, Delete={"Objects": objects_to_delete}
                )
                objects_to_delete = []

    # Delete any remaining objects that didn't complete a full batch.
    if objects_to_delete:
        s3.delete_objects(Bucket=S3_BUCKET_NAME, Delete={"Objects": objects_to_delete})


def s3_delete_collection(project_id: str, db_name: str, collection_name: str):
    prefix = generate_object_key_prefix(project_id, db_name, collection_name)
    delete_s3_objects_with_prefix(prefix)
    return True


def get_secret(secret_name):
    """
    Retrieve a secret from AWS Secrets Manager
    """
    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name="secretsmanager", region_name=os.getenv("AWS_REGION", "us-east-1")
    )

    try:
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    except Exception as e:
        logging.error(f"Error retrieving secret {secret_name}: {e}")
        raise ValueError(f"Could not retrieve secret: {e}")

    # Depending on whether the secret is a string or binary, one of these fields will be populated
    if "SecretString" in get_secret_value_response:
        return get_secret_value_response["SecretString"]
    else:
        return base64.b64decode(get_secret_value_response["SecretBinary"])


def rsa_signer(message):
    """
    Create a signer function for CloudFront signed URLs using RSA private key.
    The private key is retrieved from AWS Secrets Manager.
    """
    # Get the secret name from environment
    secret_name = os.getenv("CLOUDFRONT_PRIVATE_KEY_SECRET_NAME")

    if not secret_name:
        raise ValueError(
            "CLOUDFRONT_PRIVATE_KEY_SECRET_NAME environment variable is not set"
        )

    # Get private key from AWS Secrets Manager
    try:
        secret_value = get_secret(secret_name)
        # The secret might be stored as JSON with multiple values
        try:
            secret_json = json.loads(secret_value)
            private_key_data = secret_json.get("cloudfront_private_key", "").encode(
                "utf-8"
            )
        except json.JSONDecodeError:
            # If not JSON, assume the entire secret is the private key
            private_key_data = secret_value.encode("utf-8")
    except Exception as e:
        logging.error(f"Error retrieving private key from Secrets Manager: {e}")
        raise ValueError(f"Could not retrieve private key from Secrets Manager: {e}")

    # Load the private key
    try:
        private_key = serialization.load_pem_private_key(
            private_key_data, password=None, backend=default_backend()
        )

        # Sign the message
        return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())
    except Exception as e:
        logging.error(f"Error loading or using private key: {e}")
        raise ValueError(f"Error with private key: {e}")


def generate_signed_url(object_key):
    """
    Generate a signed URL for accessing a private S3 object.
    If S3_CUSTOM_DOMAIN is configured, uses CloudFront signed URLs.
    Otherwise, falls back to S3 signed URLs.

    Args:
        object_key: The S3 object key

    Returns:
        A string containing the signed URL
    """
    # Use CloudFront signed URL if custom domain is configured
    custom_domain = os.getenv("S3_CUSTOM_DOMAIN")
    cloudfront_key_pair_id = os.getenv("CLOUDFRONT_KEY_PAIR_ID")

    if custom_domain and cloudfront_key_pair_id:
        try:
            # For CloudFront signed URLs
            resource_url = f"https://{custom_domain}/{object_key}"

            # Create a CloudFront signer
            cf_signer = CloudFrontSigner(cloudfront_key_pair_id, rsa_signer)

            # Set expiration time
            expire_date = datetime.datetime.utcnow() + datetime.timedelta(
                seconds=int(SIGNED_URL_EXPIRATION)
            )

            # Generate the signed URL
            signed_url = cf_signer.generate_presigned_url(
                resource_url, date_less_than=expire_date
            )

            return signed_url
        except Exception as e:
            logging.error(f"Error generating CloudFront signed URL: {e}")
            # Fall back to S3 signed URL if CloudFront signing fails
            logging.warning("Falling back to S3 signed URL")

    # Use standard S3 signed URL
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": object_key},
        ExpiresIn=SIGNED_URL_EXPIRATION,
    )


def generate_public_url(object_key: str) -> str:
    """
    Generate a public URL for an S3 object that has been uploaded with public-read ACL.
    
    Args:
        object_key: The S3 object key
        
    Returns:
        A string containing the public URL for the S3 object
    """
    custom_domain = os.getenv("S3_CUSTOM_DOMAIN")
    if custom_domain:
        return f"https://{custom_domain}/{object_key}"
    else:
        notify_admin(
            "S3 Custom Domain Not Configured",
            f"S3_CUSTOM_DOMAIN environment variable is not set. Please set it to use the custom domain.",
        )
        return f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{object_key}"
