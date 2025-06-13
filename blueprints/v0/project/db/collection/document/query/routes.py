from flask import Blueprint, jsonify, request
from auth.api_key_decorator import require_api_key
from bson import json_util
from blueprints.v0.project.db.collection.document.query.services import query_chunks_service
from blueprints.v0.utils.api_key_permissions import check_api_key_permissions

v0_blueprint_query = Blueprint("v0_query", __name__, url_prefix="/query")


@v0_blueprint_query.route("", methods=["POST"])
@require_api_key
def query_chunks(permissions: list[dict], project_id: str, db_name: str, collection_name: str):
    check_api_key_permissions(permissions, project_id)

    text = request.form.get("query")
    filter_str = request.form.get("filter")
    filter = json_util.loads(filter_str) if filter_str else None
    top_k = int(request.form.get("top_k", "10"))
    projection_str = request.form.get("projection")
    projection = json_util.loads(projection_str) if projection_str else None
    include_embedding = request.form.get("include_embedding", "False").lower() == "true"
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
        include_embedding,
        emb_model,
    )

    return json_util.dumps(data), 200
