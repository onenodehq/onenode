from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs
from blueprints.v0.utils.anon_operations import get_or_create_anon_org


def list_collections_service(org_id: str, project_id: str):
    pipeline = [
        {"$match": {"_id": ObjectId(org_id)}},
        {"$unwind": "$projects"},
        {"$match": {"projects._id": ObjectId(project_id)}},
        {"$replaceRoot": {"newRoot": "$projects"}},
    ]

    project: dict = list(mongo_orgs.aggregate(pipeline))[0]
    collections = project.get("collections", [])

    return collections

def assign_anon_project_to_user_service(org_id: str, project_id: str, anon_project_id: str):
    anon_org = get_or_create_anon_org()
    anon_org_id = anon_org["_id"]
    collections = list_collections_service(anon_org_id, anon_project_id)

    if collections:
        mongo_orgs.update_one(
            {"_id": ObjectId(org_id)},
            {"$push": {"projects": {"_id": ObjectId(project_id), "collections": collections}}},
        )

        mongo_orgs.update_one(
            {"_id": ObjectId(anon_org_id)},
            {"$pull": {"projects": {"_id": ObjectId(anon_project_id)}}},
        )
    
    return


