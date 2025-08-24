import logging
import io
from typing import List
from urllib.parse import urljoin
from minio.error import S3Error
from blueprints.v0.utils.minio_setup import (
    MINIO_BUCKET_NAME,
    minio_client,
    MINIO_ENDPOINT,
    MINIO_SECURE,
)


def ensure_bucket_exists():
    """Ensure the MinIO bucket exists, create it if it doesn't."""
    try:
        if not minio_client.bucket_exists(MINIO_BUCKET_NAME):
            minio_client.make_bucket(MINIO_BUCKET_NAME)
            logging.info(f"Created bucket: {MINIO_BUCKET_NAME}")
    except S3Error as e:
        logging.error(f"Error creating bucket {MINIO_BUCKET_NAME}: {e}")
        raise RuntimeError(f"Failed to create bucket: {str(e)}")


def save_to_minio(binary_data: bytes, object_key: str, mime_type: str):
    """Save binary data to MinIO."""
    ensure_bucket_exists()
    
    try:
        # Convert bytes to a file-like object
        data_stream = io.BytesIO(binary_data)
        data_length = len(binary_data)
        
        minio_client.put_object(
            bucket_name=MINIO_BUCKET_NAME,
            object_name=object_key,
            data=data_stream,
            length=data_length,
            content_type=mime_type,
        )
        logging.info(f"Successfully saved object: {object_key}")
    except S3Error as e:
        logging.error(f"Error saving object {object_key}: {e}")
        raise RuntimeError(f"Failed to save object to MinIO: {str(e)}")


def retrieve_from_minio(object_key: str) -> tuple[bytes, str]:
    """Retrieve binary data from MinIO."""
    try:
        response = minio_client.get_object(MINIO_BUCKET_NAME, object_key)
        data = response.read()
        content_type = response.headers.get('Content-Type', 'application/octet-stream')
        response.close()
        response.release_conn()
        return data, content_type
    except S3Error as e:
        logging.error(f"Error retrieving object {object_key}: {e}")
        raise RuntimeError(f"Failed to retrieve object from MinIO: {str(e)}")


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
        "image/webp": "webp",
    }
    extension = mime_to_extension.get(mime_type, mime_type)
    normalized_path = path.replace(".", "/")

    return f"{project_id}/{database_name}/{collection_name}/{doc_id}/{normalized_path}/image.{extension}"


def generate_object_key_prefix(
    project_id: str,
    database_name: str = None,
    collection_name: str = None,
    doc_id: str = None,
    path: str = None,
) -> str:
    if database_name:
        if collection_name:
            if doc_id:
                if path:
                    normalized_path = path.replace(".", "/")
                    return f"{project_id}/{database_name}/{collection_name}/{doc_id}/{normalized_path}/"
                else:
                    return f"{project_id}/{database_name}/{collection_name}/{doc_id}/"
            else:
                return f"{project_id}/{database_name}/{collection_name}/"
        else:
            return f"{project_id}/{database_name}/"
    else:
        return f"{project_id}/"


def delete_minio_objects(object_keys: List[str]):
    """Delete objects from MinIO bucket."""
    try:
        from minio.deleteobjects import DeleteObject
        delete_object_list = [DeleteObject(key) for key in object_keys]
        errors = minio_client.remove_objects(MINIO_BUCKET_NAME, delete_object_list)
        
        # Check for any errors during deletion
        error_list = list(errors)
        if error_list:
            for error in error_list:
                logging.error(f"Error deleting object {error.object_name}: {error}")
            raise RuntimeError(f"Failed to delete some objects from MinIO")
        
        logging.info(f"Successfully deleted {len(object_keys)} objects")
        return {"deleted_objects": object_keys}
    except Exception as e:
        logging.error(f"Failed to delete objects: {e}")
        raise RuntimeError(f"Failed to delete objects from MinIO: {str(e)}")


def delete_minio_objects_with_doc_ids(
    project_id: str, db_name: str, collection_name: str, doc_ids: List[str]
):
    """Delete all objects associated with specific document IDs."""
    for doc_id in doc_ids:
        prefix = generate_object_key_prefix(
            project_id, db_name, collection_name, doc_id
        )
        delete_minio_objects_with_prefix(object_key_prefix=prefix)


def delete_minio_objects_with_prefix(object_key_prefix: str) -> None:
    """Delete all objects with a specific prefix."""
    try:
        objects_to_delete = []
        
        # List all objects with the given prefix
        objects = minio_client.list_objects(MINIO_BUCKET_NAME, prefix=object_key_prefix, recursive=True)
        
        for obj in objects:
            objects_to_delete.append(obj.object_name)
            
            # Delete in batches to avoid memory issues
            if len(objects_to_delete) >= 1000:
                delete_minio_objects(objects_to_delete)
                objects_to_delete = []
        
        # Delete any remaining objects
        if objects_to_delete:
            delete_minio_objects(objects_to_delete)
            
    except Exception as e:
        logging.error(f"Error deleting objects with prefix {object_key_prefix}: {e}")
        raise RuntimeError(f"Failed to delete objects with prefix: {str(e)}")


def minio_delete_collection(project_id: str, db_name: str, collection_name: str):
    """Delete all objects for a specific collection."""
    prefix = generate_object_key_prefix(project_id, db_name, collection_name)
    delete_minio_objects_with_prefix(prefix)
    return True


def generate_public_url(object_key: str) -> str:
    """
    Generate a public URL for a MinIO object.
    
    Args:
        object_key: The MinIO object key
        
    Returns:
        A string containing the public URL for the MinIO object
    """
    protocol = "https" if MINIO_SECURE else "http"
    return f"{protocol}://{MINIO_ENDPOINT}/{MINIO_BUCKET_NAME}/{object_key}"


# Backward compatibility aliases (to match S3 function names)
save_to_s3 = save_to_minio
retrieve_from_s3 = retrieve_from_minio
delete_s3_objects = delete_minio_objects
delete_s3_objects_with_doc_ids = delete_minio_objects_with_doc_ids
delete_s3_objects_with_prefix = delete_minio_objects_with_prefix
s3_delete_collection = minio_delete_collection