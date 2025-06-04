import datetime
from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs
from utils.email import notify_admin


def create_anon_project_if_not_exists(project_id_str: str):
    project_id = ObjectId(project_id_str)

    anon_org = mongo_orgs.find_one({"owners": "anon"})
    if not anon_org:
        result = mongo_orgs.insert_one(
            {
                "name": "Anon Organization",
                "owners": ["anon"],
                "readers": [],
            }
        )
        notify_admin("Anon organization not found and created")
        anon_org_id = result.inserted_id
    else:
        anon_org_id = anon_org["_id"]

    mongo_orgs.update_one(
        {"_id": anon_org_id},
        {
            "$set": {
                "projects": [
                    {
                        "_id": project_id,
                        "created_at": datetime.datetime.now(datetime.UTC),
                        "name": "Anon Project",
                        "owners": ["anon"],
                        "readers": [],
                        "collections": [],
                    }
                ]
            }
        },
    )

    return
