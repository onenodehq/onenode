from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth

from blueprints.private.v1.services.collection_service import (
    is_member,
    create_collection,
)


private_v1_blueprint_collection = Blueprint(
    "collection", __name__, url_prefix="/private/v1/collection"
)


@private_v1_blueprint_collection.route("", methods=["PUT"])
@requires_auth
def get_or_create_collection():
    data = request.get_json()
    org_id = data.get("org_id")
    project_id = data.get("project_id")
    collection_name = data.get("collection_name")
    onenode_id = g.onenode_id

    if not all([project_id, collection_name]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, org_id=org_id):
        return jsonify({"error": "User is not a member of the organization"}), 403

    create_collection(project_id=project_id, collection_name=collection_name)

    return jsonify({"message": "Collection created successfully"}), 200


@private_v1_blueprint_collection.route("", methods=["GET"])
@requires_auth
def get_collections():
    data = request.get_json()
    org_id = data.get("org_id")
    project_id = data.get("project_id")
    onenode_id = g.onenode_id

    if not all([org_id, project_id]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, org_id=org_id):
        return jsonify({"error": "User is not a member of the organization"}), 403

    collections = get_collections(project_id=project_id)

    return collections, 200
