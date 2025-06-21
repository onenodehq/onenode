import datetime
from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs

def get_or_create_anon_org():
    anon_org = mongo_orgs.find_one({"name": "Anon Organization"})
    if not anon_org:
        result = mongo_orgs.insert_one(
            {
                "name": "Anon Organization",
                "owners": ["anon"],
                "readers": [],
            }
        )
        anon_org = mongo_orgs.find_one({"_id": result.inserted_id})
    return anon_org
    

def create_anon_project_if_not_exists(project_id_str: str):
    project_id = ObjectId(project_id_str)

    anon_org = get_or_create_anon_org()

    anon_org_id = anon_org["_id"]

    # Check if project already exists to avoid duplicates
    existing = mongo_orgs.find_one({
        "_id": anon_org_id,
        "projects._id": project_id
    })
    
    if existing:
        return
    
    # Use $push instead of $set to avoid overwriting existing projects
    mongo_orgs.update_one(
        {"_id": anon_org_id},
        {
            "$push": {
                "projects": {
                    "_id": project_id,
                    "created_at": datetime.datetime.now(datetime.UTC),
                    "name": "Anonymous Project",
                    "owners": ["anon"],
                    "readers": [],
                    "collections": [],
                }
            }
        },
    )

    return
