from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from blueprints.private.v1.services.collection_service import (
    create_collection_service,
    delete_collection_service,
    get_collection_service,
    get_collections_service,
)
from bson import json_util
from blueprints.private.v1.services.permission_service import is_member
from blueprints.private.v1.org.project.collection.item.routes import (
    private_v1_blueprint_item,
)

private_v1_blueprint_collection = Blueprint(
    "private_v1_collection",
    __name__,
    url_prefix="/<string:project_id>/collection",
)

private_v1_blueprint_collection.register_blueprint(private_v1_blueprint_item)


@private_v1_blueprint_collection.route("", methods=["PUT"])
@requires_auth
def create_collection(org_id, project_id):
    data = request.get_json()
    collection_name = data.get("collection_name")
    onenode_id = g.onenode_id

    if not all([project_id, collection_name]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, project_id=project_id):
        return jsonify({"error": "User is not a member of the project"}), 403

    new_collection = create_collection_service(
        project_id=project_id, collection_name=collection_name
    )

    return json_util.dumps(new_collection), 200


@private_v1_blueprint_collection.route("", methods=["GET"])
@requires_auth
def get_collections(org_id, project_id):
    onenode_id = g.onenode_id

    if not all([project_id]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, project_id=project_id):
        return jsonify({"error": "User is not a member of the project"}), 403

    collections = get_collections_service(project_id=project_id)

    return json_util.dumps(collections), 200


@private_v1_blueprint_collection.route("/<string:collection_name>", methods=["DELETE"])
@requires_auth
def delete_collection(org_id, project_id, collection_name):
    onenode_id = g.onenode_id

    if not all([project_id, collection_name]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_member(onenode_id=onenode_id, project_id=project_id):
        return jsonify({"error": "User is not a member of the project"}), 403

    collections = delete_collection_service(
        project_id=project_id, collection_name=collection_name
    )

    return json_util.dumps(collections), 200


@private_v1_blueprint_collection.route("/<string:collection_name>", methods=["GET"])
@requires_auth
def get_collection(org_id, project_id, collection_name):
    onenode_id = g.onenode_id

    if not is_member(onenode_id=onenode_id, project_id=project_id):
        return jsonify({"error": "User is not a member of the project"}), 403

    collections = get_collection_service(
        project_id=project_id, collection_name=collection_name
    )

    return json_util.dumps(collections), 200
