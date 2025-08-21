from flask import Blueprint, request
from auth.api_key_decorator import require_api_key

from blueprints.v0.project.db.collection.document.services import (
    create_docs_service,
    delete_docs_service,
    update_docs_service,
)
from blueprints.v0.utils.api_key_permissions import check_api_key_permissions
from bson import json_util
from blueprints.v0.project.db.collection.document.query.routes import v0_blueprint_query
from blueprints.v0.project.db.collection.document.find.routes import v0_blueprint_find
from errors import CustomAPIError


v0_blueprint_doc = Blueprint(
    "v0_doc", __name__, url_prefix="/<string:collection_name>/document"
)

v0_blueprint_doc.register_blueprint(v0_blueprint_query)
v0_blueprint_doc.register_blueprint(v0_blueprint_find)


@v0_blueprint_doc.route("", methods=["POST"])
@require_api_key
def create_docs(permissions: list[dict], project_id: str, db_name: str, collection_name: str):
    check_api_key_permissions(permissions, project_id)

    if 'documents' not in request.form:
        raise CustomAPIError(
            "Missing 'documents' field. Request must include a 'documents' array containing at least one document.",
            status_code=400
        )

    docs = json_util.loads(request.form['documents'])
    if not docs:
        raise CustomAPIError(
            "Empty 'documents' field. Request must include a 'documents' array containing at least one document.",
            status_code=400
        )

    result = create_docs_service(
        docs,
        project_id,
        db_name,
        collection_name,
        request_files=request.files,
    )

    return json_util.dumps(result), 200


@v0_blueprint_doc.route("", methods=["PUT"])
@require_api_key
def update_docs(permissions: list[dict], project_id: str, db_name: str, collection_name: str):
    check_api_key_permissions(permissions, project_id)

    if 'filter' not in request.form or 'update' not in request.form:
        raise CustomAPIError(
            message="Missing required fields. Request must include both 'filter' and 'update' fields.",
            status_code=400
        )

    filter = json_util.loads(request.form['filter'])
    update = json_util.loads(request.form['update'])
    
    # Extract upsert parameter (defaults to False if not provided)
    upsert = request.form.get('upsert', 'false').lower() == 'true'

    if not filter:
        raise CustomAPIError(
            message="Missing 'filter' field in the request data. A filter is required to specify which documents to update.",
            status_code=400
        )
    if not update:
        raise CustomAPIError(
            message="Missing 'update' field in the request data. An update operation is required to specify the changes to apply.",
            status_code=400
        )

    try:
        result = update_docs_service(
            filter,
            update,
            project_id,
            db_name,
            collection_name,
            upsert=upsert,
            request_files=request.files,
        )
    except ValueError as e:
        # Catch PyMongo validation errors and convert to API errors
        if "update only works with $ operators" in str(e):
            raise CustomAPIError(
                message="Invalid update operation. All update operations must use MongoDB operators that start with '$'. "
                        "Use operators like $set, $inc, $push, $unset, etc. "
                        "Example: {\"$set\": {\"field\": \"value\"}} instead of {\"field\": \"value\"}",
                status_code=400
            )
        else:
            # Re-raise other ValueError instances
            raise e

    return json_util.dumps(result), 200


@v0_blueprint_doc.route("", methods=["DELETE"])
@require_api_key
def delete_docs(permissions: list[dict], project_id: str, db_name: str, collection_name: str):
    check_api_key_permissions(permissions, project_id)

    if 'filter' not in request.form:
        raise CustomAPIError(
            "Missing 'filter' field in the request data. 'None' is not allowed.",
            status_code=400
        )

    filter = json_util.loads(request.form['filter'])

    if filter is None:
        raise CustomAPIError(
            "Missing 'filter' field in the request data. 'None' is not allowed."
        )

    result = delete_docs_service(
        filter,
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(result), 200
