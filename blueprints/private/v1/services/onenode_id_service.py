# email and user_id relation service

from uuid import uuid4
from blueprints.v1.utils.mongo_setup import mongo_onenode_ids


def get_or_create_onenode_id_service(email: str):
    try:
        item = mongo_onenode_ids.find_one({"email": email})
        if item:
            onenode_id = item.get("_id")
            return onenode_id
        else:
            new_item = mongo_onenode_ids.insert_one(
                {"_id": str(uuid4()), "email": email}
            )
            onenode_id = new_item.inserted_id
            return onenode_id
    except Exception as e:
        raise e
