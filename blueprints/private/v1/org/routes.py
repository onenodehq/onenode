from flask import Blueprint, g, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.v1.org.services import (
    create_default_org_service,
    get_org_service,
    list_orgs_service,
)
from bson import json_util
from blueprints.private.v1.org.project.routes import private_v1_blueprint_project


private_v1_blueprint_org = Blueprint(
    "private_v1_org", __name__, url_prefix="/private/v1/org"
)

private_v1_blueprint_org.register_blueprint(private_v1_blueprint_project)


@private_v1_blueprint_org.route("/default", methods=["POST"])
@require_admin_api_key
def create_default_org():
    data = request.get_json()
    onenode_id = data.get("onenode_id")
    create_default_org_service(onenode_id)
    return 200


@private_v1_blueprint_org.route("/list", methods=["GET"])
@requires_auth
def list_orgs():
    onenode_id = g.onenode_id
    orgs: list = list_orgs_service(onenode_id)
    return json_util.dumps(orgs), 200


@private_v1_blueprint_org.route("/<string:org_id>", methods=["GET"])
@requires_auth
def get_org(org_id):
    org = get_org_service(org_id)
    return json_util.dumps(org), 200
