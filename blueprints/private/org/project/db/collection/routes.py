import re
from flask import Blueprint, g, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.org.project.db.collection.services import (
    create_collection_service,
    get_collection_service,
)
from bson import json_util
from blueprints.private.services import check_project_permission
from blueprints.private.org.project.db.collection.documents.routes import (
    private_blueprint_document,
)
from blueprints.v0.db.collection.services import delete_collection_service
from errors import CustomAPIError

private_blueprint_collection = Blueprint(
    "private_v1_collection",
    __name__,
    url_prefix="/<string:db_name>/collection",
)

private_blueprint_collection.register_blueprint(private_blueprint_document)


@private_blueprint_collection.route("", methods=["PUT"])
@require_admin_api_key
@requires_auth
def create_collection(org_id, project_id, db_name):
    data = request.get_json()
    collection_name = data.get("collection_name")
    if re.search(r"[^a-zA-Z0-9_]", collection_name) or re.search(
        r"[^a-zA-Z0-9_]", db_name
    ):
        raise CustomAPIError(
            "Database name or collection name cannot contain spaces or special characters."
        )

    user_id = g.user_id
    check_project_permission(user_id, org_id, project_id)

    create_collection_service(
        project_id,
        db_name,
        collection_name,
    )

    return jsonify({"message": "Collection created successfully"}), 200


@private_blueprint_collection.route("/<string:collection_name>", methods=["DELETE"])
@require_admin_api_key
@requires_auth
def delete_collection(org_id, project_id, db_name, collection_name):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    delete_collection_service(
        project_id,
        db_name,
        collection_name,
    )

    return jsonify({"message": "Collection deleted successfully"}), 200


@private_blueprint_collection.route("/<string:collection_name>", methods=["GET"])
@requires_auth
def get_collection(org_id, project_id, db_name, collection_name):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    collections: dict = get_collection_service(
        org_id,
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(collections), 200
