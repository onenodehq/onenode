from flask import Blueprint, g
from blueprints.private.org.project.db.routes import (
    private_blueprint_db,
)
from blueprints.private.org.project.api_key.routes import (
    private_blueprint_api_key,
)
from blueprints.private.org.project.services import list_collections_service
from blueprints.private.services import check_project_permission
from bson import json_util


private_blueprint_project = Blueprint(
    "private_project",
    __name__,
    url_prefix="<string:org_id>/project",
)

private_blueprint_project.register_blueprint(private_blueprint_db)
private_blueprint_project.register_blueprint(private_blueprint_api_key)


@private_blueprint_project.route(
    "<string:project_id>/list_collections", methods=["GET"]
)
def list_collections(org_id, project_id):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    collections = list_collections_service(org_id, project_id)

    return json_util.dumps(collections), 200



