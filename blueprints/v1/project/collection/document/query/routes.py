from flask import Blueprint, abort, jsonify, request
from auth.api_key_decorator import require_api_key
from bson import json_util

from blueprints.v1.project.collection.document.query.services import (
    query_chunks_service,
)
from blueprints.v1.utils.permission import can_read


v1_blueprint_query = Blueprint("v1_query", __name__, url_prefix="/query")


@v1_blueprint_query.route("", methods=["GET"])
@require_api_key
def query_chunks(
    permissions: list[dict], project_id: str, collection_name: str
):
    if not can_read(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    text = request.args.get("text")
    top_k = int(request.args.get("top_k", "10"))
    if not text:
        return jsonify({"error": "Please provide a text query parameter."}), 400

    namespace = project_id + "_" + collection_name

    data = query_chunks_service(text=text, namespace=namespace, top_k=top_k)

    response = {
        "message": "Request was successful.",
        "data": data,
    }

    return json_util.dumps(response), 200
