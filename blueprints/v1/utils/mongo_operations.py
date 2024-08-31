from flask import abort
from blueprints.v1.utils.mongo_setup import mongo_client_db
from pymongo.collection import Collection


def get_collection_or_abort(namespace: str) -> Collection:
    # Abort when collection not found
    if namespace not in mongo_client_db.list_collection_names():
        abort(404, description=f"Collection '{namespace}' not found")

    mongo_collection = mongo_client_db.get_collection(name=namespace)
    return mongo_collection


def get_document_ids_by_filter(mongo_collection: Collection, filter: dict) -> list[str]:
    documents = mongo_collection.find(filter=filter, projection={"_id": 1})
    document_ids: list[str] = [str(document["_id"]) for document in documents]
    return document_ids
