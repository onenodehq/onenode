from flask import Blueprint, request

from blueprints.v0.project.db.collection.document.services import (
    create_docs_service,
    delete_docs_service,
    update_docs_service,
)
from bson import json_util
from blueprints.v0.project.db.collection.document.json_fields import (
    load_json_form_field,
)
from blueprints.v0.project.db.collection.document.query.routes import v0_blueprint_query
from blueprints.v0.project.db.collection.document.find.routes import v0_blueprint_find
from errors import CustomAPIError


v0_blueprint_doc = Blueprint(
    "v0_doc", __name__, url_prefix="/<string:collection_name>/document"
)

v0_blueprint_doc.register_blueprint(v0_blueprint_query)
v0_blueprint_doc.register_blueprint(v0_blueprint_find)


@v0_blueprint_doc.route("", methods=["POST"])
def create_docs(project_id: str, db_name: str, collection_name: str):

    if 'documents' not in request.form:
        raise CustomAPIError(
            "Missing 'documents' field. Request must include a 'documents' array containing at least one document.",
            status_code=400
        )

    docs = load_json_form_field(request.form['documents'], "documents")
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
def update_docs(project_id: str, db_name: str, collection_name: str):

    if 'filter' not in request.form or 'update' not in request.form:
        raise CustomAPIError(
            message="Missing required fields. Request must include both 'filter' and 'update' fields.",
            status_code=400
        )

    filter = load_json_form_field(request.form['filter'], "filter")
    update = load_json_form_field(request.form['update'], "update")
    
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
def delete_docs(project_id: str, db_name: str, collection_name: str):

    if 'filter' not in request.form:
        raise CustomAPIError(
            "Missing 'filter' field in the request data. 'None' is not allowed.",
            status_code=400
        )

    filter = load_json_form_field(request.form['filter'], "filter")

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
