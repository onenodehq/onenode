import hashlib
import os
import secrets
import string
from blueprints.v1.utils.mongo_setup import mongo_api_key_collection
from dotenv import load_dotenv

load_dotenv()

ONENODE_API_KEY_LENGTH = int(os.getenv("ONENODE_API_KEY_LENGTH"))


def generate_api_key(length=ONENODE_API_KEY_LENGTH) -> str:
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


def save_api_key(hased_api_key: str, onenode_id: str, name: str = "") -> str:
    if name:
        mongo_api_key_collection.insert_one(
            {"_id": hased_api_key, "onenode_id": onenode_id, "name": name}
        )
    else:
        mongo_api_key_collection.insert_one(
            {"_id": hased_api_key, "onenode_id": onenode_id}
        )


def get_hased_api_keys_from_db(onenode_id: str) -> list:
    cursor = mongo_api_key_collection.find(
        {"onenode_id": {"$eq": onenode_id}}, {"onenode_id": 0}
    )
    hashed_keys = list(cursor)
    for hashed_key in hashed_keys:
        hashed_key["hash_value"] = hashed_key.pop("_id")
    return hashed_keys


def delete_api_key_from_db(onenode_id: str, hash_value: str) -> None:
    mongo_api_key_collection.delete_many(
        {"_id": {"$eq": hash_value}, "onenode_id": {"$eq": onenode_id}}
    )
