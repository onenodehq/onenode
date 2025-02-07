import base64
import io
import logging
from typing import Dict, List
from blueprints.v0.utils.openai_operations import image_to_text
from blueprints.v0.utils.s3_setup import (
    EXTENSION_MAP,
    S3_BUCKET_NAME,
    SIGNED_URL_EXPIRATION,
    s3,
)


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
        file_binary, S3_BUCKET_NAME, filename, ExtraArgs={"ContentType": content_type}
    )


# legacy function
def upload_to_s3(base64_image: str, mime_type: str, filename: str, namespace: str):
    keyname = namespace + "/" + filename
    binary_image = base64.b64decode(base64_image)
    file_binary = io.BytesIO(binary_image)
    s3.upload_fileobj(
        file_binary, S3_BUCKET_NAME, keyname, ExtraArgs={"ContentType": mime_type}
    )


def save_to_s3(base64_image: str, object_key: str, mime_type: str):
    binary_image = base64.b64decode(base64_image)
    file_binary = io.BytesIO(binary_image)
    s3.upload_fileobj(
        file_binary, S3_BUCKET_NAME, object_key, ExtraArgs={"ContentType": mime_type}
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
    doc_id: str,
    path: str = None,
) -> str:

    if path:
        normalized_path = path.replace(".", "/")
        return f"{project_id}/{database_name}/{collection_name}/{doc_id}/{normalized_path}/"
    else:
        return f"{project_id}/{database_name}/{collection_name}/{doc_id}/"


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


def generate_signed_url(object_key):
    expiration = SIGNED_URL_EXPIRATION
    """
    Generate a signed URL for an S3 object.

    :param bucket_name: The name of the S3 bucket.
    :param object_key: The key of the S3 object. ex) 'path/to/user-content.jpg'
    :param expiration: Time in seconds for the signed URL to remain valid (default: 3600 seconds).
    :return: The signed URL as a string.
    """
    try:
        signed_url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": object_key},
            ExpiresIn=expiration,
        )
        return signed_url
    except Exception as e:
        raise RuntimeError(e)
