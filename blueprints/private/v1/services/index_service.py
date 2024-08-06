from bson import ObjectId
from flask import g
from pymongo import CursorType
from blueprints.v1.utils.mongo_setup import (
    mongo_project_collection,
    mongo_org_collection,
    mongo_index_collection,
)


def create_index(project_id: str, index_name: str):
    new_index = mongo_index_collection.insert_one({"name": index_name})
    index_id = new_index.inserted_id

    filter = {"_id": ObjectId(project_id)}
    update = {"$push": {"indexes": index_id}}
    mongo_project_collection.update_one(filter=filter, update=update)

    return


def is_member(onenode_id: str, org_id: str) -> bool:
    org = mongo_org_collection.find_one(
        {"_id": {"$eq": ObjectId(org_id)}, "members": {"$in": [onenode_id]}}
    )
    if org:
        return True
    return False


def get_indexes(project_id: str):
    project: CursorType = mongo_project_collection.find_one(
        {"_id": {"$eq": ObjectId(project_id)}}
    )
    index_ids: list[ObjectId] = project.get("indexes")

    indexes: list = list(mongo_index_collection.find({"_id": {"$in": [index_ids]}}))

    return indexes
