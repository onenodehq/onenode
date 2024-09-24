from bson import ObjectId
from flask import abort
from blueprints.v1.utils.mongo_setup import mongo_orgs, mongo_users


def create_default_org_service(onenode_id: str):
    new_org_name = "Default Organization"
    new_project_name = "Default Project"
    new_project_id = ObjectId()
    insert_result = mongo_orgs.insert_one(
        {
            "name": new_org_name,
            "projects": [
                {
                    "_id": new_project_id,
                    "name": new_project_name,
                    "collections": [],
                }
            ],
        }
    )

    new_org_id: ObjectId = insert_result.inserted_id
    mongo_users.update_one(
        {"_id": onenode_id},
        {
            "$push": {
                "permissions": {
                    "orgs": [
                        {
                            "_id": new_org_id,
                            "name": new_org_name,
                            "role": "owner",
                            "projects": [
                                {
                                    "_id": new_project_id,
                                    "name": new_project_name,
                                    "role": "reader",
                                }
                            ],
                        },
                    ]
                }
            }
        },
    )

    return


def list_orgs_service(onenode_id: str):
    user: dict = mongo_users.find_one({"_id": onenode_id})

    if not user or not user.get("permissions", {}).get("orgs"):
        abort(404, description="User not found or permissions not available")

    org_ids = [orgs.get("_id") for orgs in user["permissions"]["orgs"]]

    if not org_ids:
        return []

    orgs = mongo_orgs.find({"_id": {"$in": org_ids}})

    return list(orgs)


def get_org_service(org_id: str):
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    return org
