import base64
import io
import logging
from typing import Dict, List
from blueprints.v1.utils.openai_operations import image_to_text
from blueprints.v1.utils.s3_setup import EXTENSION_MAP, S3_BUCKET_NAME, s3
from typeguard import typechecked


@typechecked
def process_image_resources(resources: List[Dict], ids: List[str]) -> List[Dict]:
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
                filename = f"{ids[i]}.{extension}"
                save_base64_image(base64_image=base64_image, filename=filename)

                metadata["s3_key"] = filename
                resource["metadata"] = metadata
                resource["content"] = content

            updated_resources.append(resource)

        except Exception as e:
            logging.error(f"Error processing image resource: {e}")
            raise RuntimeError(f"Failed to process resource content: {str(e)}")

    return updated_resources


def save_base64_image(base64_image, filename):
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
        upload_to_s3(file_binary, filename, content_type)

    except (base64.binascii.Error, ValueError) as e:
        logging.error(f"Failed to process base64 image: {e}")
        raise RuntimeError(f"Failed to save image to S3: {str(e)}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise RuntimeError(f"Failed to save image to S3: {str(e)}")


def upload_to_s3(file_binary, filename, content_type):
    s3.upload_fileobj(
        file_binary, S3_BUCKET_NAME, filename, ExtraArgs={"ContentType": content_type}
    )


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


def generate_signed_url(object_key, expiration=3600):
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
