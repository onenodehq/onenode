from blueprints.v0.utils.mongo_operations import get_client_db


def list_documents_service(project_id: str, db_name: str, collection_name: str):
    db = get_client_db(project_id, db_name)
    collection = db.get_collection(collection_name)
    documents = list(collection.find({}))

    return documents
