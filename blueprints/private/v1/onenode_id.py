import logging
from flask import Blueprint, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from blueprints.private.v1.services.onenode_id_service import (
    get_or_create_onenode_id_service,
)


private_v1_blueprint_onenode_id = Blueprint(
    "onenode_id", __name__, url_prefix="/private/v1/onenode-id"
)

@private_v1_blueprint_onenode_id.route("", methods=["PUT"])
@require_admin_api_key
def get_create_user_id():
    # create new email (mongo generates _id which will be onenode_user_id in auth0)
    try:
        data = request.get_json()
        email = data.get("email")
        onenode_id = get_or_create_onenode_id_service(email=email)
        return jsonify({"onenode_id": onenode_id}), 200
    except Exception as e:
        logging.error(f"Error saving getting onenode_id: {e}")
        return jsonify({"error": "An error occurred"}), 500
