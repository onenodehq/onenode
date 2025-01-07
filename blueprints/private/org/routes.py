from flask import Blueprint, g, jsonify
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.org.services import (
    create_default_org_service,
    create_stripe_customer_service,
    get_org_service,
    list_orgs_service,
)
from bson import json_util
from blueprints.private.org.project.routes import private_blueprint_project


private_blueprint_org = Blueprint("private_org", __name__, url_prefix="/org")

private_blueprint_org.register_blueprint(private_blueprint_project)


@private_blueprint_org.route("<string:org_id>/stripe", methods=["POST"])
@require_admin_api_key
@requires_auth
def create_stripe_customer(org_id):
    customer_id = create_stripe_customer_service(org_id)

    return jsonify({"status": "success", "customer_id": customer_id}), 201


@private_blueprint_org.route("/default", methods=["POST"])
@require_admin_api_key
@requires_auth
def create_default_org():
    user_id = g.user_id
    create_default_org_service(user_id)
    return jsonify({"message": "Default organization created successfully"}), 200


@private_blueprint_org.route("", methods=["GET"])
@requires_auth
def list_orgs():
    user_id = g.user_id
    orgs: list = list_orgs_service(user_id)
    return json_util.dumps(orgs), 200


@private_blueprint_org.route("/<string:org_id>", methods=["GET"])
@requires_auth
def get_org(org_id):
    org = get_org_service(org_id)
    return json_util.dumps(org), 200
