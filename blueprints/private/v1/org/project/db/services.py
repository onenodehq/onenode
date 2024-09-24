""" # Collection Lsist Retrieval Functions
from blueprints.v1.utils.mongo_setup import mongo_orgs


def list_collections_service(project_id: str):
    org = mongo_orgs.find_one(
        {"projects._id": project_id},
        {"projects.$": 1},  # Only include the matched project in the result
    )

    collections = org.get("projects", []).get("collections", [])

    return collections
 """