from os import abort
from flask import Blueprint, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from blueprints.private.v1.onenode_id.services import (
    get_onenode_account_service,
    create_onenode_account_service,
)
from blueprints.private.v1.services.org_service import (
    create_default_org_and_project_service,
)


private_v1_blueprint_onenode_id = Blueprint(
    "private_v1_onenode_id", __name__, url_prefix="/private/v1/onenode-id"
)


@private_v1_blueprint_onenode_id.route("", methods=["POST"])
@require_admin_api_key
def create_onenode_account():
    # create new email (mongo generates _id which will be onenode_user_id in auth0)
    data = request.get_json()
    email = data.get("email")
    given_name = data.get("given_name")
    family_name = data.get("family_name")
    picture = data.get("picture")
    onenode_id = create_onenode_account_service(
        email=email, given_name=given_name, family_name=family_name, picture=picture
    )
    create_default_org_and_project_service(onenode_id=onenode_id)
    return jsonify(onenode_id), 200


@private_v1_blueprint_onenode_id.route("", methods=["GET"])
@require_admin_api_key
def get_onenode_account():
    email = request.args.get("email")

    if not email:
        abort(400, description="Missing 'email' field.")

    user = get_onenode_account_service(email=email)

    return jsonify(user), 200
