from bson import ObjectId
from flask import abort
from blueprints.v1.utils.mongo_setup import mongo_users


def check_project_permission(
    onenode_id: str, org_id: str, project_id: str, role: str = "owner"
):
    user = mongo_users.find_one(
        {"_id": ObjectId(onenode_id)},
        {
            "permissions.orgs": {
                "$elemMatch": {
                    "_id": ObjectId(org_id),
                    "projects": {
                        "$elemMatch": {
                            "_id": ObjectId(project_id),
                            "role": role,
                        }
                    },
                }
            },
        },
    )

    if not user or "permissions" not in user or "orgs" not in user["permissions"]:
        abort(
            403,
            description="Access denied: User lacks permission for the specified organization or project.",
        )

    if len(user["permissions"]["orgs"]) == 0:
        abort(
            403,
            description="Access denied: User lacks permission for the specified project.",
        )

    return True
