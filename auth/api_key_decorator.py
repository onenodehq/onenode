from functools import wraps
from blueprints.private.v1.services.api_key_service import hash_api_key
from blueprints.v1.utils.mongo_setup import mongo_api_key_collection
from flask import jsonify, request


def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 400

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Invalid authorization header format"}), 400

        api_key = auth_header.split(" ")[1]
        hashed_api_key = hash_api_key(api_key=api_key)
        stored_hash = mongo_api_key_collection.find_one(filter={"_id": hashed_api_key})

        if not stored_hash:
            return jsonify({"error": "Unauthorized access"}), 401

        return f(*args, **kwargs)

    return decorated_function


def require_admin_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 400

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Invalid authorization header format"}), 400

        api_key = auth_header.split(" ")[1]
        hashed_api_key = hash_api_key(api_key=api_key)
        stored_hash = mongo_api_key_collection.find_one(filter={"_id": hashed_api_key})

        if not stored_hash or stored_hash.get("status") != "admin":
            print(stored_hash, stored_hash.get("status"))
            return jsonify({"error": "Unauthorized access"}), 401

        return f(*args, **kwargs)

    return decorated_function
