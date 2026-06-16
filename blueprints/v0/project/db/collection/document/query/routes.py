from flask import Blueprint, jsonify, request

from bson import json_util
from blueprints.v0.project.db.collection.document.json_fields import (
    load_optional_json_form_field,
)
from blueprints.v0.project.db.collection.document.query.services import query_chunks_service

v0_blueprint_query = Blueprint("v0_query", __name__, url_prefix="/query")


@v0_blueprint_query.route("", methods=["POST"])
def query_chunks(project_id: str, db_name: str, collection_name: str):

    text = request.form.get("query")
    filter_str = request.form.get("filter")
    filter = load_optional_json_form_field(filter_str, "filter")
    top_k = int(request.form.get("top_k", "10"))
    projection_str = request.form.get("projection")
    projection = load_optional_json_form_field(projection_str, "projection")
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
