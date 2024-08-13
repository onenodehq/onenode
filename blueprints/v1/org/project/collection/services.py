from blueprints.v1.utils.mongo_setup import mongo_client_db
from pymongo.collection import Collection


def find_collection(project_id: str, collection_name: str):
    collection_name = project_id + "_" + collection_name
    collection: Collection = mongo_client_db.get_collection(name=collection_name)

    return collection
