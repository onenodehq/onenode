from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_client_cluster, mongo_orgs
from pymongo.collection import Collection
from pymongo.database import Database

from errors import CustomAPIError


def register_collection(project_id: str, db_name: str, collection_name: str):
    new_collection = {
        "name": collection_name,
        "db_name": db_name,
    }
    mongo_orgs.update_one(
        {"projects._id": ObjectId(project_id)},
        {"$push": {"projects.$.collections": new_collection}},
    )


def unregister_collection(project_id: str, db_name: str, collection_name: str):
    mongo_orgs.update_one(
        {"projects._id": ObjectId(project_id)},
        {
            "$pull": {
                "projects.$.collections": {"name": collection_name, "db_name": db_name}
            }
        },
    )


def get_client_db(project_id: str, db_name: str) -> Database:
    db_id = generate_client_db_id(project_id, db_name)
    database = mongo_client_cluster.get_database(db_id)
    return database


def generate_client_db_id(project_id: str, db_name: str):
    return project_id + "_" + db_name


def split_db_id(db_id: str):
    try:
        # Attempt to split the input string
        project_id, db_name = db_id.split("_", 1)
    except ValueError:
        # Return a 400 Bad Request error with a custom message
        raise Exception(
            f"Invalid db_id format: '{db_id}'. Expected format: 'project_id_db_name'."
        )

    return project_id, db_name


def get_client_collection(
    project_id: str,
    db_name: str,
    collection_name: str,
    must_exist: bool = True,
) -> Collection:
    db_id = generate_client_db_id(project_id, db_name)
    if must_exist and db_id not in mongo_client_cluster.list_database_names():
        raise CustomAPIError(
            f"Database `{db_id}` not found",
        )
    db = mongo_client_cluster.get_database(db_id)

    if must_exist and collection_name not in db.list_collection_names():
        raise CustomAPIError(
            f"Collection '{collection_name}' not found",
        )
    collection = db.get_collection(name=collection_name)

    if not must_exist and (
        db_id not in mongo_client_cluster.list_database_names()
        or collection_name not in db.list_collection_names()
    ):
        register_collection(project_id, db_name, collection_name)

    return collection


def get_doc_ids_by_filter(
    filter: dict, project_id: str, db_name: str, collection_name: str
) -> list[str]:
    collection = get_client_collection(project_id, db_name, collection_name)
    docs = collection.find(filter=filter, projection={"_id": 1})
    doc_ids: list[str] = [str(doc["_id"]) for doc in docs]
    return doc_ids
