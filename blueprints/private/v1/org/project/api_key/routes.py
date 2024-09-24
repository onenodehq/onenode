from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from blueprints.private.v1.org.project.api_key.services import (
    delete_api_key_from_db,
    generate_api_key,
    hash_api_key,
    list_hashed_api_keys_service,
    save_api_key,
)
from bson import json_util
from blueprints.private.v1.services.permission_service import check_project_permission


private_v1_blueprint_api_key = Blueprint(
    "private_v1_api_key",
    __name__,
    url_prefix="/<string:project_id>/api-key",
)


@private_v1_blueprint_api_key.route("", methods=["POST"])
@requires_auth
def create_api_key(org_id, project_id):
    onenode_id = g.onenode_id
    check_project_permission(onenode_id, org_id, project_id)

    data = request.get_json()
    key_name = data.get("name", "")
    api_key = generate_api_key()
    hashed_api_key = hash_api_key(api_key=api_key)
    save_api_key(
        onenode_id,
        hashed_api_key,
        org_id,
        project_id,
        key_name,
    )
    return (
        jsonify({"name": key_name, "value": api_key, "hash_value": hashed_api_key}),
        200,
    )


@private_v1_blueprint_api_key.route("", methods=["GET"])
@requires_auth
def list_hashed_api_keys(org_id, project_id):
    onenode_id = g.onenode_id
    check_project_permission(onenode_id, org_id, project_id)

    hashed_api_keys = list_hashed_api_keys_service(project_id)
    return json_util.dumps(hashed_api_keys), 200


@private_v1_blueprint_api_key.route("", methods=["DELETE"])
@requires_auth
def delete_api_key(org_id, project_id):
    onenode_id = g.onenode_id
    check_project_permission(onenode_id, org_id, project_id)

    data = request.get_json()
    hash_value = data.get("hash_value", "")
    delete_api_key_from_db(hash_value, org_id, project_id)
    return jsonify({"message": "API key deleted successfully"}), 200
