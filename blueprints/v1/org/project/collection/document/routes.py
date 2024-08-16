import json
from xml.dom.minidom import Document
from flask import Blueprint, abort, request

from auth.api_key_decorator import require_api_key
from blueprints.v1.org.project.collection.document.services import (
    delete_documents_service,
    process_document,
    update_documents_service,
)
from blueprints.v1.utils.permission import can_edit
from bson import json_util


v1_blueprint_document = Blueprint(
    "v1_document", __name__, url_prefix="/<string:collection_name>/document"
)


@v1_blueprint_document.route("", methods=["POST"])
@require_api_key
def create_documents(permissions, org_id, project_id, collection_name):
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    namespace = project_id + "_" + collection_name

    data = request.get_json()
    documents: list[dict] = json_util.loads(json.dumps(data.get("documents")))

    saved_documents: list[dict] = process_document(
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
def update_documents(permissions, org_id, project_id, collection_name):
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    namespace = project_id + "_" + collection_name
    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")
    update = data.get("update")

    update_documents_service(filter=filter, update=update, namespace=namespace)

    return {"message": "Documents updated successfully."}, 200


@v1_blueprint_document.route("", methods=["DELETE"])
@require_api_key
def delete_documents(permissions, org_id, project_id, collection_name):
    if not can_edit(permissions=permissions, project_id=project_id):
        abort(403, description="You do not have permission.")

    namespace = project_id + "_" + collection_name
    data = request.get_json()
    filter = data.get("filter")

    delete_documents_service(filter=filter, namespace=namespace)
    return {"message": "Documents deleted successfully."}, 200
