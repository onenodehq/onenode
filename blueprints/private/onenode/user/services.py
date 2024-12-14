from uuid import uuid4
from blueprints.v0.utils.mongo_setup import mongo_onenode_users


def create_user_service(email: str, given_name: str, family_name: str, picture) -> dict:
    try:
        user = mongo_onenode_users.find_one({"email": email})
        if not user:
            new_user = {
                "_id": str(uuid4()),
                "email": email,
                "given_name": given_name,
                "family_name": family_name,
                "picture": picture,
            }
            mongo_onenode_users.insert_one(new_user)

            return new_user
    except Exception as e:
        raise e


def get_user_by_email_service(email: str):
    filter = {"email": {"$eq": email}}
    user: dict = mongo_onenode_users.find_one(filter)
    return user


def get_user_by_access_token_service(user_id):
    filter = {"_id": {"$eq": user_id}}
    user: dict = mongo_onenode_users.find_one(filter)
    return user
