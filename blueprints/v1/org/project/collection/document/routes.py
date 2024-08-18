from flask import Blueprint, abort, request
from auth.api_key_decorator import require_api_key
from blueprints.v1.org.project.collection.document.helper import (
    validate_json_content_type,
)
from blueprints.v1.org.project.collection.document.services import (
    create_documents_service,
    delete_documents_service,
    update_documents_service,
)
from blueprints.v1.utils.permission import can_edit
from bson import json_util


v1_blueprint_document = Blueprint(
    "v1_document", __name__, url_prefix="/<string:collection_name>/document"
)


@v1_blueprint_document.route("", methods=["POST"])
@require_api_key
def create_documents(
    permissions: list[dict], org_id: str, project_id: str, collection_name: str
):
    validate_json_content_type()
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    namespace = project_id + "_" + collection_name

    data = json_util.loads(request.get_data(as_text=True))
    documents: list[dict] = data.get("documents")
    if not documents:
        abort(400, description="Missing 'documents' field.")

    saved_documents: list[dict] = create_documents_service(
        documents=documents, namespace=namespace
    )

    response = {
        "status": "success",
        "message": "Request was successful.",
        "data": saved_documents,
    }

    return json_util.dumps(response), 200


@v1_blueprint_document.route("", methods=["PUT"])
@require_api_key
def update_documents(
    permissions: list[dict], org_id: str, project_id: str, collection_name: str
):
    validate_json_content_type()
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    namespace = project_id + "_" + collection_name
    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")
    update = data.get("update")

    if not filter:
        abort(400, description="Missing 'filter' field in the request data.")
    if not update:
        abort(400, description="Missing 'update' field in the request data.")

    update_documents_service(filter=filter, update=update, namespace=namespace)

    return {"message": "documents updated successfully."}, 200


@v1_blueprint_document.route("", methods=["DELETE"])
@require_api_key
def delete_documents(
    permissions: list[dict], org_id: str, project_id: str, collection_name: str
):
    validate_json_content_type()
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    namespace = project_id + "_" + collection_name
    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")

    if not filter:
        abort(400, description="Missing 'filter' field in the request data.")

    delete_documents_service(filter=filter, namespace=namespace)
    return {"message": "documents deleted successfully."}, 200
