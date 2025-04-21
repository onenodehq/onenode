from flask import Blueprint, g, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.user.services import (
    create_user_service,
    delete_user_service,
    get_user_by_access_token_service,
    get_user_by_email_service,
)
from errors import CustomAPIError
from utils.email import notify_admin


private_blueprint_user = Blueprint("private_user", __name__, url_prefix="/user")


@private_blueprint_user.route("", methods=["POST"])
@require_admin_api_key
def create_user():
    # create new email (mongo generates _id which will be onenode_user_id in auth0)
    data = request.get_json()
    email = data.get("email")
    given_name = data.get("given_name")
    family_name = data.get("family_name")
    picture = data.get("picture")
    app = data.get("app")

    if not email or not given_name or not family_name or not picture:
        raise CustomAPIError(
            "Missing required parameters: 'email', 'given_name', 'family_name', or 'picture'"
        )

    new_user = create_user_service(
        email=email, given_name=given_name, family_name=family_name, picture=picture
    )

    notify_admin("New signup", f"New sign up on {app}\nUser: {email} \n-end-")
    return jsonify(new_user), 200

@private_blueprint_user.route("/<user_id>", methods=["DELETE"])
@require_admin_api_key
def delete_user(user_id):
    if not user_id:
        raise CustomAPIError(
            "Missing required parameters: 'user_id'"
        )

    delete_user_service(user_id)

    return "", 204

@private_blueprint_user.route("/email", methods=["GET"])
@require_admin_api_key
def get_user_by_email():
    email = request.args.get("email")
    if not email:
        raise CustomAPIError("Missing 'email' param.")

    user = get_user_by_email_service(email=email)

    return jsonify(user), 200


@private_blueprint_user.route("/token", methods=["GET"])
@requires_auth
def get_user_by_access_token():
    user_id = g.user_id
    user = get_user_by_access_token_service(user_id=user_id)

    return jsonify(user), 200
