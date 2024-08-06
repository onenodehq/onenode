from flask import Blueprint, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.org_service import (
    create_default_org_and_project_service,
    get_orgs_and_projects_servie,
)
from bson import json_util


private_v1_blueprint_org = Blueprint("org", __name__, url_prefix="/private/v1/org")


@private_v1_blueprint_org.route("/default", methods=["PUT"])
@require_admin_api_key
def create_default_org_and_project():
    data = request.get_json()
    onenode_id = data.get("onenode_id")
    create_default_org_and_project_service(onenode_id)
    return 200


@private_v1_blueprint_org.route("", methods=["GET"])
@requires_auth
def get_orgs_and_projects():
    orgs_and_projects: list = get_orgs_and_projects_servie()
    return json_util.dumps(orgs_and_projects), 200
