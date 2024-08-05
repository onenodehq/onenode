from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth

from blueprints.private.v1.services.collection_service import (
    is_member,
    create_index,
)


private_v1_blueprint_index = Blueprint(
    "index", __name__, url_prefix="/private/v1/index"
)


@private_v1_blueprint_index.route("", methods=["PUT"])
@requires_auth
def get_or_create_index():
    data = request.get_json()
    org_id = data.get("org_id")
    project_id = data.get("project_id")
    index_name = data.get("index_name")
    onenode_id = g.onenode_id

    if not all([project_id, index_name]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, org_id=org_id):
        return jsonify({"error": "User is not a member of the organization"}), 403

    create_index(
        project_id=project_id, index_name=index_name
    )

    return jsonify({"message": "Index created successfully"}), 200
