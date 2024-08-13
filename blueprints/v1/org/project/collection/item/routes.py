from flask import Blueprint, abort, jsonify

from auth.api_key_decorator import require_api_key
from blueprints.v1.org.project.collection.services import find_collection
from blueprints.v1.utils.permission import can_edit


v1_blueprint_item = Blueprint(
    "v1_item", __name__, url_prefix="/<string:collection_name>/item"
)


@v1_blueprint_item.route("", methods=["POST"])
@require_api_key
def create_item(permissions, org_id, project_id, collection_name):
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    collection = find_collection(project_id=project_id, collection_name=collection_name)

    if not collection:
        return jsonify({"error": f"Collection '{collection_name}' not found"}), 404

