from bson import ObjectId
from flask import abort
from blueprints.v1.utils.mongo_setup import mongo_orgs


def check_project_permission(
    onenode_id: str, org_id: str, project_id: str, role: str = "owners"
):
    query = {
        "_id": ObjectId(
            org_id
        ),  # Use this line if _id is of type ObjectId, otherwise use "_id": org_id
        "projects": {"$elemMatch": {"_id": ObjectId(project_id), role: onenode_id}},
    }

    org = mongo_orgs.find_one(query)

    if not org:
        abort(
            403,
            description="Access denied: User lacks permission for the specified project.",
        )

    return True
