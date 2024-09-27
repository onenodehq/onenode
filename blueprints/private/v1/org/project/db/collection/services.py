from bson import ObjectId
from flask import abort
from blueprints.v1.utils.mongo_operations import (
    get_client_collection,
    get_client_db,
)
from blueprints.v1.utils.mongo_setup import mongo_orgs
from blueprints.v1.utils.pinecone_operations import pc_client_delete_collection


def register_collection(
    org_id: str, project_id: str, db_name: str, collection_name: str
):
    new_collection = {
        "name": collection_name,
        "db_name": db_name,
    }
    mongo_orgs.update_one(
        {"_id": ObjectId(org_id), "projects._id": ObjectId(project_id)},
        {"$push": {"projects.$.collections": new_collection}},
    )


def create_client_collection(project_id: str, db_name: str, collection_name: str):
    db = get_client_db(project_id, db_name)
    db.create_collection(name=collection_name)


def create_collection_service(
    org_id: str, project_id: str, db_name: str, collection_name: str
):
    create_client_collection(
        project_id,
        db_name,
        collection_name,
    )
    register_collection(org_id, project_id, db_name, collection_name)
    return


# Collection Retrieval Functions
def get_collection_service(
    org_id: str, project_id: str, db_name: str, collection_name: str
) -> dict:
    result = mongo_orgs.find_one(
        {  # fetch filter
            "_id": ObjectId(org_id),
        },
        {  # return value filter
            "projects": {
                "$elemMatch": {
                    "_id": ObjectId(project_id),
                    "collections": {
                        "$elemMatch": {
                            "name": collection_name,
                            "db_name": db_name,
                        }
                    },
                }
            },
        },
    )
    # Check if the result or projects field is missing
    if not result or not result.get("projects"):
        abort(404, description="Project not found.")

    # Retrieve the projects list
    projects = result["projects"]

    # Check if collections exist in the project and is not empty
    if "collections" not in projects[0] or not projects[0]["collections"]:
        abort(404, description="Collection not found.")

    # Return the first collection (since we used $elemMatch it should be the only one)
    collection: dict = projects[0]["collections"][0]

    return collection


# Collection Deletion Functions
def drop_client_collection(project_id: str, db_name: str, collection_name: str):
    collection = get_client_collection(project_id, db_name, collection_name)
    collection.drop()


def unregister_collection(
    org_id: str, project_id: str, db_name: str, collection_name: str
):
    mongo_orgs.update_one(
        {"_id": ObjectId(org_id), "projects._id": ObjectId(project_id)},
        {
            "$pull": {
                "projects.$.collections": {"name": collection_name, "db_name": db_name}
            }
        },
    )


def delete_collection_service(
    org_id: str, project_id: str, db_name: str, collection_name: str
):
    drop_client_collection(project_id, db_name, collection_name)
    unregister_collection(org_id, project_id, db_name, collection_name)
    pc_client_delete_collection(project_id, db_name, collection_name)
