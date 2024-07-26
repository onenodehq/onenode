import logging
from flask import Blueprint, jsonify
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.user_id_service import (
    get_or_create_user_id_service,
)


private_v1_blueprint_email = Blueprint(
    "user_id", __name__, url_prefix="/private/v1/user-id"
)

@private_v1_blueprint_email.route("", methods=["PUT"])
@requires_auth
def create_email():
    # create new email (mongo generates _id which will be onenode_user_id in auth0)
    try:
        response = get_or_create_user_id_service()
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
