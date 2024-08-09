from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.collection_service import (
    create_collection_service,
    delete_collection_service,
    get_collection_items_service,
    get_collections_service,
    is_member,
)
from bson import json_util


private_v1_blueprint_collection = Blueprint(
    "private_v1_collection", __name__, url_prefix="/private/v1/collection"
)


@private_v1_blueprint_collection.route("", methods=["PUT"])
@requires_auth
def create_collection():
    data = request.get_json()
    org_id = data.get("org_id")
    project_id = data.get("project_id")
    collection_name = data.get("collection_name")
    onenode_id = g.onenode_id

    if not all([project_id, collection_name]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, org_id=org_id):
        return jsonify({"error": "User is not a member of the organization"}), 403

    create_collection_service(project_id=project_id, collection_name=collection_name)

    return jsonify({"message": "Collection created successfully"}), 200


@private_v1_blueprint_collection.route("", methods=["GET"])
@requires_auth
def get_collections():
    org_id = request.args.get("org_id")
    project_id = request.args.get("project_id")
    onenode_id = g.onenode_id

    if not all([org_id, project_id]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, org_id=org_id):
        return jsonify({"error": "User is not a member of the organization"}), 403

    collections = get_collections_service(project_id=project_id)

    return json_util.dumps(collections), 200


@private_v1_blueprint_collection.route("", methods=["DELETE"])
@requires_auth
def delete_collection():
    org_id = request.args.get("org_id")
    collection_id = request.args.get("collection_id")
    onenode_id = g.onenode_id

    if not all([org_id, collection_id]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, org_id=org_id):
        return jsonify({"error": "User is not a member of the organization"}), 403

    collections = delete_collection_service(collection_id=collection_id)

    return json_util.dumps(collections), 200
