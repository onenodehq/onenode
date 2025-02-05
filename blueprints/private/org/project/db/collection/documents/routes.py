from flask import Blueprint, g, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from bson import json_util
from blueprints.private.org.project.db.collection.documents.services import (
    list_documents_service,
)
from blueprints.private.services import check_project_permission
from blueprints.v0.db.collection.document.services import delete_docs_service
from blueprints.v0.utils.api_key_permissions import check_api_key_permissions
from blueprints.v0.utils.mongo_operations import split_db_id
from errors import CustomAPIError

private_blueprint_document = Blueprint(
    "private_document",
    __name__,
    url_prefix="/<string:collection_name>/document",
)


@private_blueprint_document.route("/list", methods=["GET"])
@requires_auth
def list_documents(org_id, project_id, db_name, collection_name):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    documents = list_documents_service(
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(documents), 200


@private_blueprint_document.route("", methods=["DELETE"])
@requires_auth
@require_admin_api_key
def delete_docs(
    org_id: str,
    project_id: str,
    db_name: str,
    collection_name: str,
):
    user_id = g.user_id
    check_project_permission(user_id, org_id, project_id)

    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")
    print("filter", filter)

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
