from flask import Blueprint, jsonify, request
from auth.api_key_decorator import require_api_key
from bson import json_util
from blueprints.v1.db.collection.document.query.services import query_chunks_service
from blueprints.v1.utils.api_key_permissions import check_api_key_permissions
from blueprints.v1.utils.mongo_operations import split_db_id


v1_blueprint_query = Blueprint("v1_query", __name__, url_prefix="/query")


@v1_blueprint_query.route("", methods=["POST"])
@require_api_key
def query_chunks(permissions: list[dict], db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    text = request.form.get("query")
    filter_str = request.form.get("filter")
    filter = json_util.loads(filter_str) if filter_str else None
    top_k = int(request.form.get("top_k", "10"))
    projection_str = request.form.get("projection")
    projection = json_util.loads(projection_str) if projection_str else None
    include_values = request.form.get("include_values", "False").lower() == "true"
    emb_model = request.form.get("emb_model", "text-embedding-3-small")

    if not text:
        return jsonify({"error": "Please provide a text query parameter."}), 400

    data = query_chunks_service(
        project_id,
        db_name,
        collection_name,
        text,
        filter,
        top_k,
        projection,
        include_values,
        emb_model,
    )

    response = {
        "matches": data,
    }

    return json_util.dumps(response), 200
