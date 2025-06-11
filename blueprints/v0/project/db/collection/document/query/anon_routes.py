from flask import Blueprint, jsonify, request, g
from bson import json_util
from blueprints.v0.project.db.collection.document.query.services import query_chunks_service
from blueprints.v0.utils.anon_operations import create_anon_project_if_not_exists


v0_blueprint_anon_query = Blueprint("v0_anon_query", __name__, url_prefix="/query")

@v0_blueprint_anon_query.route("", methods=["POST"])
def query_chunks_anon(project_id: str, db_name: str, collection_name: str):
    g.plan = "free"
    create_anon_project_if_not_exists(project_id)

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

    return json_util.dumps(data), 200
