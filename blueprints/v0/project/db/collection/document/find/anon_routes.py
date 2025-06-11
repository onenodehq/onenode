from flask import Blueprint, request, g
from bson import json_util
from blueprints.v0.project.db.collection.document.find.services import find_docs_service
from blueprints.v0.utils.anon_operations import create_anon_project_if_not_exists


v0_blueprint_anon_find = Blueprint("v0_anon_find", __name__, url_prefix="/find")


@v0_blueprint_anon_find.route("", methods=["POST"])
def find_docs_anon(project_id: str, db_name: str, collection_name: str):
    g.plan = "free"
    create_anon_project_if_not_exists(project_id)

    filter_str = request.form.get("filter")
    filter = json_util.loads(filter_str) if filter_str else None
    
    projection_str = request.form.get("projection")
    projection = json_util.loads(projection_str) if projection_str else None
    
    sort_str = request.form.get("sort")
    sort = json_util.loads(sort_str) if sort_str else None
    
    skip_str = request.form.get("skip")
    skip = int(skip_str) if skip_str else None
    
    limit_str = request.form.get("limit")
    limit = int(limit_str) if limit_str else None

    data = find_docs_service(
        project_id,
        db_name,
        collection_name,
        filter,
        projection,
        sort,
        skip,
        limit,
    )

    return json_util.dumps(data), 200
