import logging
from flask import Blueprint, jsonify, request
from typeguard import typechecked
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.org_service import (
    get_or_create_org_and_project,
    get_orgs_and_projects_from_db,
)
from bson import json_util


private_v1_blueprint_org = Blueprint("org", __name__, url_prefix="/private/v1/org")


@private_v1_blueprint_org.route("/default", methods=["PUT"])
@require_admin_api_key
def get_or_create_org():
    try:
        data = request.get_json()
        onenode_id = data.get("onenode_id")
        get_or_create_org_and_project(onenode_id)
        return 200
    except Exception as e:
        logging.error(f"Error checking default org: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@private_v1_blueprint_org.route("", methods=["GET"])
@requires_auth
def get_orgs_and_projects():
    orgs_and_projects: list = get_orgs_and_projects_from_db()
    return json_util.dumps(orgs_and_projects), 200
