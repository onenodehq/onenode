from bson import ObjectId
from blueprints.v1.utils.mongo_setup import (
    mongo_projects,
)


def get_project_service(projcet_id: str, onenode_id: str):
    project = mongo_projects.find_one(
        {"_id": ObjectId(projcet_id), "members": {"$in": [onenode_id]}}
    )
    return project
