from blueprints.v1.utils.mongo_operations import generate_client_db_id, get_client_db


def list_documents_service(project_id: str, db_name: str, collection_name: str):
    client_db_name = generate_client_db_id(project_id, db_name)
    db = get_client_db(client_db_name=client_db_name)
    collection = db.get_collection(collection_name)
    documents = list(collection.find({}))

    return documents
