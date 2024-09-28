from flask import Blueprint, g
from auth.auth_decorator import requires_auth
from blueprints.private.v1.org.project.db.routes import (
    private_v1_blueprint_db,
)
from blueprints.private.v1.org.project.api_key.routes import (
    private_v1_blueprint_api_key,
)
from blueprints.private.v1.org.project.services import list_collections_service
from blueprints.private.v1.services.permission_service import check_project_permission
from bson import json_util

private_v1_blueprint_project = Blueprint(
    "private_v1_project",
    __name__,
    url_prefix="<string:org_id>/project",
)

private_v1_blueprint_project.register_blueprint(private_v1_blueprint_db)
private_v1_blueprint_project.register_blueprint(private_v1_blueprint_api_key)


@private_v1_blueprint_project.route(
    "<string:project_id>/list_collections", methods=["GET"]
)
@requires_auth
def list_collections(org_id, project_id):
    onenode_id = g.onenode_id

    check_project_permission(onenode_id, org_id, project_id)

    collections = list_collections_service(org_id, project_id)

    return json_util.dumps(collections), 200
