from uuid import uuid4
from flask import g
from blueprints.private.v1 import onenode_id
from blueprints.v1.utils.mongo_setup import (
    mongo_org_collection,
    mongo_project_collection,
)


def get_or_create_org_and_project(onenode_id: str):
    try:
        org = mongo_org_collection.find_one({"members": {"$in": [onenode_id]}})
        if not org:
            new_project = mongo_project_collection.insert_one({"collections": []})
            new_project_id = new_project.inserted_id
            mongo_org_collection.insert_one(
                {"members": [onenode_id], "projects": [new_project_id]}
            )
            return
    except Exception as e:
        raise e
