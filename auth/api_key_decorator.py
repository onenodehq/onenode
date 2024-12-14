from functools import wraps
from blueprints.private.org.project.api_key.services import hash_api_key
from blueprints.v0.utils.mongo_setup import mongo_api_keys
from flask import g, jsonify, request


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
        stored_hash = mongo_api_keys.find_one(filter={"_id": hashed_api_key})
        g.plan = stored_hash.get("plan", "free")
        if not stored_hash:
            return jsonify({"error": "Unauthorized access"}), 401

        permissions = stored_hash.get("permissions")

        return f(*args, permissions, **kwargs)

    return decorated_function


def require_admin_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_api_key = request.headers.get("X-Admin-API-Key")
        if not admin_api_key:
            return jsonify({"error": "Admin API key missing"}), 400

        hashed_api_key = hash_api_key(api_key=admin_api_key)
        stored_hash = mongo_api_keys.find_one(filter={"_id": hashed_api_key})

        if not stored_hash or stored_hash.get("status") != "admin":
            return jsonify({"error": "Unauthorized access"}), 401

        return f(*args, **kwargs)

    return decorated_function
