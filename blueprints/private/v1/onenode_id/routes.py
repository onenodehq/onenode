from flask import Blueprint, abort, g, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.v1.onenode_id.services import (
    create_user_service,
    get_user_by_access_token_service,
    get_user_by_email_service,
)
from blueprints.private.v1.org.services import create_default_org_service


private_v1_blueprint_user = Blueprint(
    "private_v1_user", __name__, url_prefix="/private/v1/user"
)


@private_v1_blueprint_user.route("", methods=["POST"])
@require_admin_api_key
def create_user():
    # create new email (mongo generates _id which will be onenode_user_id in auth0)
    data = request.get_json()
    email = data.get("email")
    given_name = data.get("given_name")
    family_name = data.get("family_name")
    picture = data.get("picture")
    onenode_id = create_user_service(
        email=email, given_name=given_name, family_name=family_name, picture=picture
    )
    create_default_org_service(onenode_id)
    return jsonify(onenode_id), 200


@private_v1_blueprint_user.route("/email", methods=["GET"])
@require_admin_api_key
def get_user_by_email():
    email = request.args.get("email")
    if not email:
        abort(400, description="Missing 'email' param.")

    user = get_user_by_email_service(email=email)

    return jsonify(user), 200


@private_v1_blueprint_user.route("/token", methods=["GET"])
@requires_auth
def get_user_by_access_token():
    onenode_id = g.onenode_id
    user = get_user_by_access_token_service(onenode_id=onenode_id)

    return jsonify(user), 200
