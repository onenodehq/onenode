import hashlib
import os
import secrets
import string
from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs, mongo_api_keys
from dotenv import load_dotenv

load_dotenv()

CAPYBARA_API_KEY_LENGTH = int(os.getenv("CAPYBARA_API_KEY_LENGTH"))


def generate_api_key(length=CAPYBARA_API_KEY_LENGTH) -> str:
    alphabet = string.ascii_letters + string.digits
    api_key = "".join(secrets.choice(alphabet) for _ in range(length))
    return api_key


def hash_api_key(api_key: str) -> str:
    # Create a SHA-256 hash object
    hash_object = hashlib.sha256()
    # Update the hash object with the bytes of the API key
    hash_object.update(api_key.encode("utf-8"))
    # Get the hexadecimal representation of the hash
    hashed_api_key = hash_object.hexdigest()
    return hashed_api_key


def save_api_key(
    user_id: str, hashed_api_key: str, project_id: str, key_name: str = ""
) -> str:
    org = mongo_orgs.find_one(
        {"projects": {"$elemMatch": {"_id": ObjectId(project_id)}}}
    )
    if not org:
        raise Exception("Organization not found")
    plan = org.get("plan", "free")

    new_api_key = {
        "_id": hashed_api_key,
        "name": key_name,
        "owner": user_id,
        "plan": plan,
        "permissions": {
            "projects": [
                {
                    "_id": ObjectId(project_id),
                    "role": "owner",
                }
            ],
        },
    }

    mongo_api_keys.insert_one(new_api_key)


def list_hashed_api_keys_service(project_id: str) -> list:
    hashed_keys = list(
        mongo_api_keys.find(
            {
                "permissions.projects": {
                    "$elemMatch": {
                        "_id": ObjectId(project_id),
                    }
                },
            }
        )
    )
    for hashed_key in hashed_keys:
        hashed_key["hash_value"] = hashed_key.pop("_id")
    return hashed_keys


def delete_api_key_from_db(hash_value: str, project_id: str) -> None:
    mongo_api_keys.delete_one(
        {
            "_id": hash_value,  # Assuming this is the unique identifier of the document
            "permissions.projects": {
                "$elemMatch": {
                    "_id": ObjectId(project_id),
                }
            },
        }
    )
