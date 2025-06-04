from flask import Blueprint, jsonify, request, g
from bson import json_util
from blueprints.v0.db.collection.document.query.services import query_chunks_service
from blueprints.v0.utils.anon_operations import create_anon_project_if_not_exists
from blueprints.v0.utils.mongo_operations import split_db_id


v0_blueprint_query_anon = Blueprint("v0_query_anon", __name__, url_prefix="/query/anon")

@v0_blueprint_query_anon.route("", methods=["POST"])
def query_chunks_anon(db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)
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

    response = {
        "matches": data,
    }

    return json_util.dumps(response), 200
