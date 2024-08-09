from bson import ObjectId
from blueprints.v1.utils.mongo_setup import mongo_projects


def is_member(onenode_id: str, project_id: str):
    project = mongo_projects.find_one(
        {"_id": ObjectId(project_id), "members": {"$in": [onenode_id]}}
    )

    return bool(project)
