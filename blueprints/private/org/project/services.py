from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs


def list_collections_service(org_id: str, project_id: str):
    pipeline = [
        {"$match": {"_id": ObjectId(org_id)}},
        {"$unwind": "$projects"},
        {"$match": {"projects._id": ObjectId(project_id)}},
        {"$replaceRoot": {"newRoot": "$projects"}},
    ]

    projects = list(mongo_orgs.aggregate(pipeline))
    if not projects:
        return []
    
    project: dict = projects[0]
    collections = project.get("collections", [])

    return collections
