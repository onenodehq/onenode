from flask import Blueprint, abort, jsonify, request

from auth.api_key_decorator import require_api_key
from blueprints.v1.org.project.collection.document.services import process_document
from blueprints.v1.org.project.collection.services import find_collection
from blueprints.v1.utils.permission import can_edit
from bson import json_util


v1_blueprint_document = Blueprint(
    "v1_document", __name__, url_prefix="/<string:collection_name>/document"
)


@v1_blueprint_document.route("", methods=["POST"])
@require_api_key
def create_item(permissions, org_id, project_id, collection_name):
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    collection = find_collection(project_id=project_id, collection_name=collection_name)

    if collection is None:
        abort(404, description=f"Collection '{collection_name}' not found")

    data = request.get_json()
    document = data.get("document")

    saved_document = process_document(document=document, monogo_collection=collection)

    response = {
        "status": "success",
        "message": "Request was successful.",
        "data": saved_document,
    }

    return json_util.dumps(response), 200
