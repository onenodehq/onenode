from flask import Blueprint, abort, jsonify, request
from auth.api_key_decorator import require_api_key
from blueprints.v0.db.collection.document.services import (
    create_docs_service,
    delete_docs_service,
    update_docs_service,
)
from blueprints.v0.utils.api_key_permissions import check_api_key_permissions
from blueprints.v0.utils.mongo_operations import split_db_id
from bson import json_util
from blueprints.v0.db.collection.document.query.routes import v0_blueprint_query
from blueprints.v0.db.collection.document.find.routes import v0_blueprint_find
from blueprints.v0.utils.validations import validate_json_content_type


v0_blueprint_doc = Blueprint(
    "v0_doc", __name__, url_prefix="/<string:collection_name>/document"
)

v0_blueprint_doc.register_blueprint(v0_blueprint_query)
v0_blueprint_doc.register_blueprint(v0_blueprint_find)


@v0_blueprint_doc.route("", methods=["POST"])
@require_api_key
def create_docs(permissions: list[dict], db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    data = json_util.loads(request.get_data(as_text=True))
    docs: list[dict] = data.get("documents")
    if not docs:
        abort(400, description="Missing 'documents' field.")

    result = create_docs_service(
        docs,
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(result), 200


@v0_blueprint_doc.route("", methods=["PUT"])
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

    result = update_docs_service(
        filter,
        update,
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(result), 200


@v0_blueprint_doc.route("", methods=["DELETE"])
@require_api_key
def delete_docs(permissions: list[dict], db_id: str, collection_name: str):
    validate_json_content_type()
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")

    if not filter:
        abort(400, description="Missing 'filter' field in the request data.")

    result = delete_docs_service(
        filter,
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(result), 200
