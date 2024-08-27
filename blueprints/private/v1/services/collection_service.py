from bson import ObjectId
from flask import g
from pymongo import CursorType
from blueprints.v1.utils.mongo_setup import (
    mongo_projects,
    mongo_collections,
    mongo_client_db,
)
from blueprints.v1.utils.pinecone_operations import pc_client_delete_namespace
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
    namespace: list[str] = project.get("collections")

    collections: list = list(mongo_collections.find({"name": {"$in": namespace}}))

    return collections


# Collection Retrieval Functions
def get_collection_service(project_id: str, collection_name: str):
    namespace = project_id + "_" + collection_name
    collection = mongo_collections.find_one({"name": {"$eq": namespace}})

    return collection


# Collection Deletion Functions
def drop_collection_from_client_db(namespace: str):
    collection = mongo_client_db.get_collection(name=namespace)
    collection.drop()


def delete_collection(namespace: str):
    filter = {"name": namespace}
    mongo_collections.delete_one(filter=filter)


def delete_collection_from_project(project_id: str, namespace: str):
    mongo_projects.update_one(
        {"_id": ObjectId(project_id)}, {"$pull": {"collections": namespace}}
    )


def delete_collection_service(project_id: str, collection_name: str):
    namespace = project_id + "_" + collection_name
    drop_collection_from_client_db(namespace)
    delete_collection(namespace)
    delete_collection_from_project(project_id=project_id, namespace=namespace)
    namespaces = pc_client_index.describe_index_stats().get("namespaces", {}).keys()
    if namespace in namespaces:
        pc_client_delete_namespace(namespace=namespace)


# Collection Items Retrieval Functions
def get_collection_items_service(project_id: str, collection_name: str):
    namespace = project_id + "_" + collection_name
    collection = mongo_client_db.get_collection(name=namespace)
    items = list(collection.find({}))

    return items
