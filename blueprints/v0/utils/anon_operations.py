import datetime
from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs
from utils.email import notify_admin

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
    
    # Create new anonymous project
    created_at = datetime.datetime.now(datetime.UTC)
    
    # Use $push instead of $set to avoid overwriting existing projects
    mongo_orgs.update_one(
        {"_id": anon_org_id},
        {
            "$push": {
                "projects": {
                    "_id": project_id,
                    "created_at": created_at,
                    "name": "Anonymous Project",
                    "owners": ["anon"],
                    "readers": [],
                    "collections": [],
                }
            }
        },
    )

    # Notify admin about new anonymous project creation
    try:
        notify_admin(
            subject="New Anonymous Project Created",
            body=f"A new anonymous project has been created.\n\n"
                 f"Project ID: {project_id_str}\n"
                 f"Created at: {created_at.isoformat()}\n"
                 f"Organization: Anon Organization\n\n"
                 f"This project will be automatically cleaned up after 30 days if not claimed."
        )
    except Exception as e:
        # Log the error but don't fail the project creation
        print(f"Failed to send admin notification for new anon project {project_id_str}: {str(e)}")

    return
