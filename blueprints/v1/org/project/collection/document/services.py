from flask import abort
from blueprints.v1.utils.pinecone_operations import pc_client_delete_with_prefixes
from blueprints.v1.utils.mongo_setup import mongo_client_db
from celery_tasks import create_documents_task, update_documents_task


def create_documents_service(documents: list[dict], namespace: str) -> list[dict]:
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection '{namespace}' not found")

    task = create_documents_task.delay(documents=documents, namespace=namespace)
    result = task.id

    return result


def update_documents_service(filter: dict, update: dict, namespace: str):
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection not found")

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
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection not found")

    documents_to_delete = mongo_collection.find(filter=filter, projection={"_id": 1})
    document_ids: list[str] = [str(document["_id"]) for document in documents_to_delete]

    if not document_ids:
        return

    mongo_collection.delete_many(filter=filter)
    pc_client_delete_with_prefixes(prefixes=document_ids, namespace=namespace)
    return
