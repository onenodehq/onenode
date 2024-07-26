import logging
from flask import Blueprint, g, jsonify
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.api_key_service import (
    generate_api_key,
    hash_api_key,
    save_api_key,
)


private_v1_blueprint_api_key = Blueprint(
    "api_key", __name__, url_prefix="/private/v1/api-key"
)


@private_v1_blueprint_api_key.route("", methods=["POST"])
def create_api_key():
    # create new email (mongo generates _id which will be onenode_user_id in auth0)
    try:
        api_key = generate_api_key()
        hashed_api_key = hash_api_key(api_key=api_key)
        save_api_key(hased_api_key=hashed_api_key, onenode_id=g.onenode_id)
        return jsonify({"api_key": api_key}), 200
    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
