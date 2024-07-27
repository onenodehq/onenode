import logging
from flask import Blueprint, jsonify
from auth.api_key_decorator import require_api_key
from blueprints.private.v1.services.onenode_id_service import (
    get_or_create_onenode_id_service,
)


private_v1_blueprint_onenode_id = Blueprint(
    "onenode_id", __name__, url_prefix="/private/v1/onenode-id"
)

@private_v1_blueprint_onenode_id.route("", methods=["PUT"])
@require_api_key
def get_create_user_id():
    # create new email (mongo generates _id which will be onenode_user_id in auth0)
    try:
        response = get_or_create_onenode_id_service()
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
