from bson import ObjectId
from flask import g
from pymongo import CursorType
from blueprints.v1.utils.mongo_setup import (
    mongo_projects,
    mongo_orgs,
    mongo_collections,
    mongo_collection_db,
)


# Collection Insertion and Creation Functions
def insert_collection(collection_name: str):
    new_collection = mongo_collections.insert_one({"name": collection_name})
    return new_collection.inserted_id


def update_project_with_collection(project_id: str, collection_id: ObjectId):
    filter = {"_id": ObjectId(project_id)}
    update = {"$push": {"collections": collection_id}}
    mongo_projects.update_one(filter=filter, update=update)


def create_database_collection(collection_id: ObjectId):
    mongo_collection_db.create_collection(name=str(collection_id))


def create_collection_service(project_id: str, collection_name: str):
    collection_id = insert_collection(collection_name)
    update_project_with_collection(project_id, collection_id)
    create_database_collection(collection_id)


# Organization Functions
def is_member(onenode_id: str, org_id: str) -> bool:
    org = mongo_orgs.find_one(
        {"_id": {"$eq": ObjectId(org_id)}, "members": {"$in": [onenode_id]}}
    )
    if org:
        return True
    return False


# Collection Retrieval Functions
def get_collections_service(project_id: str):
    project: CursorType = mongo_projects.find_one(
        {"_id": {"$eq": ObjectId(project_id)}}
    )
    collection_ids: list[ObjectId] = project.get("collections")

    collections: list = list(mongo_collections.find({"_id": {"$in": collection_ids}}))

    return collections


# Collection Deletion Functions
def drop_database_collection(collection_id: str):
    collection = mongo_collection_db.get_collection(name=collection_id)
    collection.drop()


def delete_collection_document(collection_id: str):
    filter = {"_id": ObjectId(collection_id)}
    mongo_collections.delete_one(filter=filter)


def delete_collection_service(collection_id: str):
    drop_database_collection(collection_id)
    delete_collection_document(collection_id)
