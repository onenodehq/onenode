import os
from celery_tasks import get_cached_usage
from errors import CustomAPIError

FREE_STORAGE_MB = os.getenv("FREE_STORAGE_MB", 100)
FREE_VECTOR_STORAGE_MB = os.getenv("FREE_VECTOR_STORAGE_MB", 30)
FREE_REQUEST_LIMIT = os.getenv("FREE_REQUEST_LIMIT", 500)


def check_current_usage(project_id: str):
    stats = get_cached_usage(project_id)

    if stats:
        if stats.get("mongo_total_mb", 0) >= FREE_STORAGE_MB:
            return CustomAPIError("Storage limit exceeded.", status_code=402)
        if stats.get("pinecone_mb", 0) >= FREE_VECTOR_STORAGE_MB:
            return CustomAPIError("Vector storage limit exceeded.", status_code=402)

    return None
