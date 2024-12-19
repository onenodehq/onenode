from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs


def create_default_org_service(user_id: str):
    new_org_name = "Default Organization"
    new_project_name = "Default Project"
    new_project_id = ObjectId()

    existing_org = mongo_orgs.find_one({"owners": user_id})
    if existing_org:
        raise Exception("An organization with this user_id in owners already exists.")

    mongo_orgs.insert_one(
        {
            "name": new_org_name,
            "owners": [user_id],
            "readers": [],
            "plan": "free",
            "projects": [
                {
                    "_id": new_project_id,
                    "name": new_project_name,
                    "owners": [user_id],
                    "readers": [],
                    "collections": [],
                }
            ],
        }
    )

    return


def list_orgs_service(user_id: str):
    # Query to find organizations with `user_id` in either `owners` or `readers` list
    query = {"$or": [{"owners": user_id}, {"readers": user_id}]}

    orgs = list(mongo_orgs.find(query))

    return orgs


def get_org_service(org_id: str):
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    return org
