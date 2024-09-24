from flask import Blueprint, g
from auth.auth_decorator import requires_auth
from bson import json_util
from blueprints.private.v1.org.project.db.collection.documents.services import (
    list_documents_service,
)
from blueprints.private.v1.services.permission_service import check_project_permission

private_v1_blueprint_document = Blueprint(
    "private_v1_document",
    __name__,
    url_prefix="/<string:collection_name>/document",
)


@private_v1_blueprint_document.route("/list", methods=["GET"])
@requires_auth
def list_documents(org_id, project_id, db_name, collection_name):
    onenode_id = g.onenode_id

    check_project_permission(onenode_id, org_id, project_id)

    documents = list_documents_service(
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(documents), 200
