from flask import Blueprint, request
from auth.api_key_decorator import require_api_key
from bson import json_util
from blueprints.v0.db.collection.document.find.services import find_docs_service
from blueprints.v0.utils.api_key_permissions import check_api_key_permissions
from blueprints.v0.utils.mongo_operations import split_db_id


v0_blueprint_find = Blueprint("v0_find", __name__, url_prefix="/find")


@v0_blueprint_find.route("", methods=["POST"])
@require_api_key
def find_docs(permissions: list[dict], db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")
    projection = data.get("projection")
    sort = data.get("sort")
    skip = data.get("skip")
    limit = data.get("limit")

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

    response = {
        "docs": data,
    }

    return json_util.dumps(response), 200
