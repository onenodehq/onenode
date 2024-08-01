import logging
from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.api_key_service import (
    generate_api_key,
    get_api_key_metadata,
    hash_api_key,
    save_api_key,
)


private_v1_blueprint_api_key = Blueprint(
    "api_key", __name__, url_prefix="/private/v1/api-key"
)


@private_v1_blueprint_api_key.route("", methods=["POST"])
@requires_auth
def create_api_key():
    data = request.get_json()
    name = data.get("key_name", "")
    api_key = generate_api_key()
    onenode_id = g.onenode_id
    hashed_api_key = hash_api_key(api_key=api_key)
    save_api_key(hased_api_key=hashed_api_key, onenode_id=onenode_id, name=name)
    return jsonify({"api_key": api_key}), 200


@private_v1_blueprint_api_key.route("", methods=["GET"])
@requires_auth
def get_api_key_metadata():
    onenode_id = g.onenode_id
    api_key_metadata = get_api_key_metadata(onenode_id=onenode_id)
    print("result\n\n\n", api_key_metadata)
    return jsonify(api_key_metadata), 200
