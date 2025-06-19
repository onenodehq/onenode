from flask import Blueprint, g, request
from blueprints.v0.project.db.collection.document.services import (
    create_docs_service,
    delete_docs_service,
    update_docs_service,
)
from blueprints.v0.utils.anon_operations import create_anon_project_if_not_exists
from bson import json_util
from errors import CustomAPIError
from blueprints.v0.project.db.collection.document.query.anon_routes import v0_blueprint_anon_query
from blueprints.v0.project.db.collection.document.find.anon_routes import v0_blueprint_anon_find

v0_blueprint_anon_doc = Blueprint(
    "v0_anon_doc", __name__, url_prefix="/<string:collection_name>/document"
)

v0_blueprint_anon_doc.register_blueprint(v0_blueprint_anon_query)
v0_blueprint_anon_doc.register_blueprint(v0_blueprint_anon_find)

# anon endpoint for trial users without api key
@v0_blueprint_anon_doc.route("", methods=["POST"])
def create_docs_anon(project_id: str, db_name: str, collection_name: str):
    g.plan = "free"
    create_anon_project_if_not_exists(project_id)

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


@v0_blueprint_anon_doc.route("", methods=["PUT"])
def update_docs_anon(project_id: str, db_name: str, collection_name: str):
    g.plan = "free"
    create_anon_project_if_not_exists(project_id)

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

    result = update_docs_service(
        filter,
        update,
        project_id,
        db_name,
        collection_name,
        upsert=upsert,
        request_files=request.files,
    )

    return json_util.dumps(result), 200


@v0_blueprint_anon_doc.route("", methods=["DELETE"])
def delete_docs_anon(project_id: str, db_name: str, collection_name: str):
    g.plan = "free"
    create_anon_project_if_not_exists(project_id)

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
