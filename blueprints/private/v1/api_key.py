from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.api_key_service import (
    delete_api_key_from_db,
    generate_api_key,
    get_api_key_metadata_from_db,
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
    return jsonify({"name": name, "value": api_key, "hash_value": hashed_api_key}), 200


@private_v1_blueprint_api_key.route("", methods=["GET"])
@requires_auth
def get_api_key_metadata():
    onenode_id = g.onenode_id
    api_key_metadata = get_api_key_metadata_from_db(onenode_id=onenode_id)
    return jsonify(api_key_metadata), 200


@private_v1_blueprint_api_key.route("", methods=["DELETE"])
@requires_auth
def delete_api_key():
    onenode_id = g.onenode_id
    data = request.get_data()
    hash_value = data.get("hash_value", "")
    delete_api_key_from_db(onenode_id=onenode_id, hash_value=hash_value)
    return jsonify({"message": "API key deleted successfully"}), 200
