from flask import Blueprint, abort, jsonify, request
from auth.api_key_decorator import require_api_key
from blueprints.v1.db.collection.document.services import (
    create_docs_service,
    delete_docs_service,
    update_docs_service,
)
from blueprints.v1.utils.api_key_permissions import check_api_key_permissions
from blueprints.v1.utils.mongo_operations import split_db_id
from bson import json_util
from blueprints.v1.db.collection.document.query.routes import (
    v1_blueprint_query,
)
from blueprints.v1.utils.validations import validate_json_content_type


v1_blueprint_doc = Blueprint(
    "v1_doc", __name__, url_prefix="/<string:collection_name>/document"
)

v1_blueprint_doc.register_blueprint(v1_blueprint_query)


@v1_blueprint_doc.route("", methods=["POST"])
@require_api_key
def create_docs(permissions: list[dict], db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    data = json_util.loads(request.get_data(as_text=True))
    docs: list[dict] = data.get("documents")
    if not docs:
        abort(400, description="Missing 'documents' field.")

    task_id: str = create_docs_service(
        docs,
        project_id,
        db_name,
        collection_name,
    )

    response = {
        "message": "Request was successful.",
        "taskId": task_id,
    }

    return jsonify(response), 200


@v1_blueprint_doc.route("", methods=["PUT"])
@require_api_key
def update_docs(permissions: list[dict], db_id: str, collection_name: str):
    validate_json_content_type()
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")
    update = data.get("update")

    if not filter:
        abort(400, description="Missing 'filter' field in the request data.")
    if not update:
        abort(400, description="Missing 'update' field in the request data.")

    task_id = update_docs_service(
        filter,
        update,
        project_id,
        db_name,
        collection_name,
    )

    response = {"message": "documents updated successfully.", "taskId": task_id}

    return jsonify(response), 200


@v1_blueprint_doc.route("", methods=["DELETE"])
@require_api_key
def delete_docs(permissions: list[dict], db_id: str, collection_name: str):
    validate_json_content_type()
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")

    if not filter:
        abort(400, description="Missing 'filter' field in the request data.")

    delete_docs_service(
        filter,
        project_id,
        db_name,
        collection_name,
    )
    return {"message": "documents deleted successfully."}, 200
