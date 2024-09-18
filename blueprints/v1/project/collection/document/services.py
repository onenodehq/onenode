from blueprints.v1.utils.mongo_operations import (
    get_collection_or_abort,
    get_document_ids_by_filter,
)
from blueprints.v1.utils.pinecone_operations import pc_client_delete_with_prefixes
from celery_tasks import create_documents_task, update_documents_task


def create_documents_service(documents: list[dict], namespace: str) -> list[dict]:
    get_collection_or_abort(namespace=namespace)

    task = create_documents_task.delay(documents=documents, namespace=namespace)
    result = task.id

    return result


def update_documents_service(filter: dict, update: dict, namespace: str):
    mongo_collection = get_collection_or_abort(namespace=namespace)

    documents_to_update = mongo_collection.find(filter=filter, projection={"_id": 1})
    document_ids: list[str] = [str(document["_id"]) for document in documents_to_update]
    if not document_ids:
        return

    task = update_documents_task.delay(
        document_ids=document_ids, filter=filter, update=update, namespace=namespace
    )
    result = task.id

    return result


def delete_documents_service(filter: dict, namespace: str):
    mongo_collection = get_collection_or_abort(namespace=namespace)

    document_ids = get_document_ids_by_filter(
        mongo_collection=mongo_collection, filter=filter
    )

    if not document_ids:
        return

    mongo_collection.delete_many(filter=filter)
    pc_client_delete_with_prefixes(prefixes=document_ids, namespace=namespace)
    return
