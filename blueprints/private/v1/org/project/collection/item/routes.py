from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from bson import json_util
from blueprints.private.v1.services.permission_service import is_member
from blueprints.private.v1.services.collection_service import (
    get_collection_items_service,
)


private_v1_blueprint_item = Blueprint(
    "private_v1_item",
    __name__,
    url_prefix="/<string:collection_name>/item",
)


@private_v1_blueprint_item.route("", methods=["GET"])
@requires_auth
def get_collection_items(org_id, project_id, collection_name):
    onenode_id = g.onenode_id

    if not is_member(onenode_id=onenode_id, project_id=project_id):
        return jsonify({"error": "User is not a member of the project"}), 403

    items = get_collection_items_service(
        project_id=project_id, collection_name=collection_name
    )

    return json_util.dumps(items), 200
