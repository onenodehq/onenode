from flask import Blueprint, g
from auth.auth_decorator import requires_auth
from bson import json_util
from blueprints.private.v1.services.project_service import get_project_service
from blueprints.private.v1.org.project.collection.routes import (
    private_v1_blueprint_collection,
)
from blueprints.private.v1.org.project.api_key.routes import (
    private_v1_blueprint_api_key,
)

private_v1_blueprint_project = Blueprint(
    "private_v1_project",
    __name__,
    url_prefix="<string:org_id>/project",
)

private_v1_blueprint_project.register_blueprint(private_v1_blueprint_collection)
private_v1_blueprint_project.register_blueprint(private_v1_blueprint_api_key)


@private_v1_blueprint_project.route("/<string:project_id>", methods=["GET"])
@requires_auth
def get_project(org_id, project_id):
    onenode_id = g.onenode_id
    project = get_project_service(projcet_id=project_id, onenode_id=onenode_id)
    return json_util.dumps(project), 200
