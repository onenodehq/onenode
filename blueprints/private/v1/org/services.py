from bson import ObjectId
from flask import abort
from blueprints.v1.utils.mongo_setup import mongo_orgs, mongo_users


def create_default_org_service(onenode_id: str):
    new_org_name = "Default Organization"
    new_project_name = "Default Project"
    new_project_id = ObjectId()

    existing_org = mongo_orgs.find_one({"owners": onenode_id})
    if existing_org:
        abort(
            400,
            description="An organization with this onenode_id in owners already exists.",
        )

    mongo_orgs.insert_one(
        {
            "name": new_org_name,
            "owners": [onenode_id],
            "readers": [],
            "plan": "free",
            "projects": [
                {
                    "_id": new_project_id,
                    "name": new_project_name,
                    "owners": [onenode_id],
                    "readers": [],
                    "collections": [],
                }
            ],
        }
    )

    return


def list_orgs_service(onenode_id: str):
    # Query to find organizations with `onenode_id` in either `owners` or `readers` list
    query = {"$or": [{"owners": onenode_id}, {"readers": onenode_id}]}

    orgs = list(mongo_orgs.find(query))

    return orgs


def get_org_service(org_id: str):
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    return org
