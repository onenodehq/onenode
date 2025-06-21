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

    projects = list(mongo_orgs.aggregate(pipeline))
    if not projects:
        return []
    
    project: dict = projects[0]
    collections = project.get("collections", [])

    return collections

def assign_anon_project_to_user_service(org_id: str, project_id: str, anon_project_id: str):
    anon_org = get_or_create_anon_org()
    anon_org_id = anon_org["_id"]

    print(anon_org_id)
    
    # Check if the anonymous project exists
    anon_project_exists = mongo_orgs.find_one({
        "_id": anon_org_id,
        "projects._id": ObjectId(anon_project_id)
    })
    
    if not anon_project_exists:
        return {"success": False, "message": f"Anonymous project with ID '{anon_project_id}' not found"}
    
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
        
        return {"success": True, "message": "Anonymous project imported successfully"}
    else:
        return {"success": True, "message": "Anonymous project found but no collections to import"}


