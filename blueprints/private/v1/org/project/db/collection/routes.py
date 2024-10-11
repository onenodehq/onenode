import re
from flask import Blueprint, abort, g, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.v1.org.project.db.collection.services import (
    create_collection_service,
    delete_collection_service,
    get_collection_service,
)
from bson import json_util
from blueprints.private.v1.services.permission_service import check_project_permission
from blueprints.private.v1.org.project.db.collection.documents.routes import (
    private_v1_blueprint_document,
)

private_v1_blueprint_collection = Blueprint(
    "private_v1_collection",
    __name__,
    url_prefix="/<string:db_name>/collection",
)

private_v1_blueprint_collection.register_blueprint(private_v1_blueprint_document)


@private_v1_blueprint_collection.route("", methods=["PUT"])
@require_admin_api_key
@requires_auth
def create_collection(org_id, project_id, db_name):
    data = request.get_json()
    collection_name = data.get("collection_name")
    if re.search(r"[^a-zA-Z0-9_]", collection_name) or re.search(
        r"[^a-zA-Z0-9_]", db_name
    ):
        abort(
            400,
            description="Database name or collection name cannot contain spaces or special characters.",
        )

    onenode_id = g.onenode_id
    check_project_permission(onenode_id, org_id, project_id)

    create_collection_service(
        org_id,
        project_id,
        db_name,
        collection_name,
    )

    return jsonify({"message": "Collection created successfully"}), 200


@private_v1_blueprint_collection.route("/<string:collection_name>", methods=["DELETE"])
@require_admin_api_key
@requires_auth
def delete_collection(org_id, project_id, db_name, collection_name):
    onenode_id = g.onenode_id

    check_project_permission(onenode_id, org_id, project_id)

    delete_collection_service(
        org_id,
        project_id,
        db_name,
        collection_name,
    )

    return jsonify({"message": "Collection deleted successfully"}), 200


@private_v1_blueprint_collection.route("/<string:collection_name>", methods=["GET"])
@requires_auth
def get_collection(org_id, project_id, db_name, collection_name):
    onenode_id = g.onenode_id

    check_project_permission(onenode_id, org_id, project_id)

    collections: dict = get_collection_service(
        org_id,
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(collections), 200
