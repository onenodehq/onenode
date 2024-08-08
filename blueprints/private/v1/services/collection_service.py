from bson import ObjectId
from flask import g
from pymongo import CursorType
from blueprints.v1.utils.mongo_setup import (
    mongo_projects,
    mongo_orgs,
    mongo_collections,
    mongo_collection_db,
)


def create_collection(project_id: str, collection_name: str):
    new_collection = mongo_collections.insert_one({"name": collection_name})
    collection_id = new_collection.inserted_id

    filter = {"_id": ObjectId(project_id)}
    update = {"$push": {"collections": collection_id}}
    mongo_projects.update_one(filter=filter, update=update)

    return


def is_member(onenode_id: str, org_id: str) -> bool:
    org = mongo_orgs.find_one(
        {"_id": {"$eq": ObjectId(org_id)}, "members": {"$in": [onenode_id]}}
    )
    if org:
        return True
    return False


def get_collections_service(project_id: str):
    project: CursorType = mongo_projects.find_one(
        {"_id": {"$eq": ObjectId(project_id)}}
    )
    collection_ids: list[ObjectId] = project.get("collections")

    collections: list = list(mongo_collections.find({"_id": {"$in": collection_ids}}))

    return collections


def delete_collection_service(collection_id: str):
    collection = mongo_collection_db.get_collection(name=collection_id)
    collection.drop()

    return
