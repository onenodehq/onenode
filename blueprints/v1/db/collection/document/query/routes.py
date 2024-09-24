from flask import Blueprint, jsonify, request
from auth.api_key_decorator import require_api_key
from bson import json_util
from blueprints.v1.db.collection.document.query.services import query_chunks_service
from blueprints.v1.utils.api_key_permissions import check_api_key_permissions
from blueprints.v1.utils.mongo_operations import split_db_id


v1_blueprint_query = Blueprint("v1_query", __name__, url_prefix="/query")


@v1_blueprint_query.route("", methods=["GET"])
@require_api_key
def query_chunks(permissions: list[dict], db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    text = request.args.get("text")
    top_k = int(request.args.get("top_k", "10"))
    if not text:
        return jsonify({"error": "Please provide a text query parameter."}), 400

    data = query_chunks_service(
        text=text, project_id=project_id, collection_name=collection_name, top_k=top_k
    )

    response = {
        "message": "Request was successful.",
        "data": data,
    }

    return json_util.dumps(response), 200
