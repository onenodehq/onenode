import hashlib
import secrets
import string
from blueprints.v1.utils.mongo_setup import mongo_api_key_collection


def generate_api_key(length=64) -> string:
    alphabet = string.ascii_letters + string.digits
    api_key = "".join(secrets.choice(alphabet) for _ in range(length))
    return api_key


def hash_api_key(api_key: string) -> string:
    # Create a SHA-256 hash object
    hash_object = hashlib.sha256()
    # Get the hexadecimal representation of the hash
    hashed_api_key = hash_object.hexdigest()
    return hashed_api_key


def save_api_key(hased_api_key: string, onenode_id: string) -> string:
    try:
        mongo_api_key_collection.insert_one(
            {"_id": hased_api_key, "onenode_id": onenode_id}
        )
    except Exception as e:
        raise e
