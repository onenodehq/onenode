from blueprints.v1.utils.mongo_operations import get_client_collection, unregister_collection
from blueprints.v1.utils.pinecone_operations import pc_client_delete_collection
from blueprints.v1.utils.s3_operations import s3_delete_collection


def delete_collection_service(project_id: str, db_name: str, collection_name: str):
    drop_client_collection(project_id, db_name, collection_name)
    pc_client_delete_collection(project_id, db_name, collection_name)
    s3_delete_collection(project_id, db_name, collection_name)
    unregister_collection(project_id, db_name, collection_name)
    return True

def drop_client_collection(project_id: str, db_name: str, collection_name: str):
    collection = get_client_collection(project_id, db_name, collection_name)
    collection.drop()