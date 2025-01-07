from bson import ObjectId
from flask import g
import stripe
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
            "plan": {
                "type": "free",
            },
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


def create_stripe_customer_service(org_id: str):
    user_email = g.email
    user_name = g.given_name + " " + g.family_name
    metadata = {
        "org_id": org_id,
    }

    customer = stripe.Customer.create(
        email=user_email,
        name=user_name,
        metadata=metadata,
    )

    mongo_orgs.update_one(
        {
            "_id": ObjectId(org_id),
        },
        {"$set": {"stripe_id": customer.id}},
    )

    return customer.id
