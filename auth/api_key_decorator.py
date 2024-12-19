from functools import wraps
from blueprints.private.org.project.api_key.services import hash_api_key
from blueprints.v0.utils.mongo_setup import mongo_api_keys
from flask import g, request

from errors import AuthError


def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise AuthError("Authorization header missing")

        if not auth_header.startswith("Bearer "):
            raise AuthError("Invalid authorization header format")

        api_key = auth_header.split(" ")[1]
        hashed_api_key = hash_api_key(api_key=api_key)
        stored_hash = mongo_api_keys.find_one(filter={"_id": hashed_api_key})
        if not stored_hash:
            raise AuthError("Unauthorized access")
        g.plan = stored_hash.get("plan", "free")

        permissions = stored_hash.get("permissions")

        return f(*args, permissions, **kwargs)

    return decorated_function


def require_admin_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_api_key = request.headers.get("X-Admin-API-Key")
        if not admin_api_key:
            raise AuthError("Admin API key missing")

        hashed_api_key = hash_api_key(api_key=admin_api_key)
        stored_hash = mongo_api_keys.find_one(filter={"_id": hashed_api_key})

        if not stored_hash or stored_hash.get("status") != "admin":
            raise AuthError("Unauthorized access")

        return f(*args, **kwargs)

    return decorated_function
