from uuid import uuid4
from blueprints.v1.utils.mongo_setup import mongo_users


def create_user_service(
    email: str, given_name: str, family_name: str, picture
):
    try:
        item = mongo_users.find_one({"email": email})
        if not item:
            new_item = mongo_users.insert_one(
                {
                    "_id": str(uuid4()),
                    "email": email,
                    "given_name": given_name,
                    "family_name": family_name,
                    "picture": picture,
                }
            )
            onenode_id = new_item.inserted_id
            return onenode_id
    except Exception as e:
        raise e


def get_user_by_email_service(email: str):
    filter = {"email": {"$eq": email}}
    user: dict = mongo_users.find_one(filter)
    return user


def get_user_by_access_token_service(onenode_id):
    filter = {"_id": {"$eq": onenode_id}}
    user: dict = mongo_users.find_one(filter)
    return user