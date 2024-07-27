# email and user_id relation service

from flask import g
from blueprints.v1.utils.mongo_setup import mongo_email_collection


def get_or_create_onenode_id_service():
    try:
        email = g.user.get("email")

        item = mongo_email_collection.find_one({"email": email})
        if item:
            user_id = item.get("_id")
            return user_id
        else:
            new_item = mongo_email_collection.insert_one({"email": email})
            user_id = new_item.inserted_id
    except Exception as e:
        raise e
