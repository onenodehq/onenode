import logging
from flask import Blueprint, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from blueprints.private.v1.services.org_service import get_or_create_org_and_project


private_v1_blueprint_org = Blueprint(
    "org", __name__, url_prefix="/private/v1/default-org"
)


@private_v1_blueprint_org.route("", methods=["PUT"])
@require_admin_api_key
def get_or_create_org():
    try:
        data = request.get_json()
        onenode_id = data.get("onenode_id")
        get_or_create_org_and_project(onenode_id)
        return 200
    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
