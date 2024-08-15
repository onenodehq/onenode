from bson import ObjectId
from flask import g
from pymongo import CursorType
from blueprints.v1.utils.mongo_setup import (
    mongo_projects,
    mongo_collections,
    mongo_client_db,
)
from blueprints.v1.utils.pinecone_setup import pc_client_index


# Collection Insertion and Creation Functions
def insert_collection(collection_name: str):
    result = mongo_collections.insert_one({"name": collection_name})
    new_collection = mongo_collections.find_one({"_id": result.inserted_id})
    return new_collection


def update_project_with_collection(project_id: str, collection_name: str):
    filter = {"_id": ObjectId(project_id)}
    update = {"$push": {"collections": collection_name}}
    mongo_projects.update_one(filter=filter, update=update)


def create_database_collection(collection_name: str):
    mongo_client_db.create_collection(name=collection_name)


def create_collection_service(project_id: str, collection_name: str):
    collection_name = project_id + "_" + collection_name
    create_database_collection(collection_name=collection_name)
    update_project_with_collection(project_id, collection_name)
    new_collection = insert_collection(collection_name)
    return new_collection


# Collection Lsist Retrieval Functions
def get_collections_service(project_id: str):
    project: CursorType = mongo_projects.find_one(
        {"_id": {"$eq": ObjectId(project_id)}}
    )
    collection_names: list[str] = project.get("collections")

    collections: list = list(
        mongo_collections.find({"name": {"$in": collection_names}})
    )

    return collections


# Collection Retrieval Functions
def get_collection_service(project_id: str, collection_name: str):
    collection_name = project_id + "_" + collection_name
    collection = mongo_collections.find_one({"name": {"$eq": collection_name}})

    return collection


# Collection Deletion Functions
def drop_database_collection(collection_name: str):
    collection = mongo_client_db.get_collection(name=collection_name)
    collection.drop()
    pc_client_index.delete(delete_all=True, namespace=collection_name)


def delete_collection_document(collection_name: str):
    filter = {"name": collection_name}
    mongo_collections.delete_one(filter=filter)


def delete_collection_from_project(project_id: str, collection_name: str):
    mongo_projects.update_one(
        {"_id": ObjectId(project_id)}, {"$pull": {"collections": collection_name}}
    )


def delete_collection_service(project_id: str, collection_name: str):
    collection_name = project_id + "_" + collection_name
    drop_database_collection(collection_name)
    delete_collection_document(collection_name)
    delete_collection_from_project(
        project_id=project_id, collection_name=collection_name
    )


# Collection Items Retrieval Functions
def get_collection_items_service(project_id: str, collection_name: str):
    collection_name = project_id + "_" + collection_name
    collection = mongo_client_db.get_collection(name=collection_name)
    items = list(collection.find({}))

    return items
