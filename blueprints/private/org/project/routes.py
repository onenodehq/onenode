from flask import Blueprint, g, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.org.project.db.routes import (
    private_blueprint_db,
)
from blueprints.private.org.project.api_key.routes import (
    private_blueprint_api_key,
)
from blueprints.private.org.project.services import assign_anon_project_to_user_service, list_collections_service
from blueprints.private.services import check_project_permission
from bson import json_util

from celery_tasks import get_cached_usage

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
@requires_auth
def list_collections(org_id, project_id):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    collections = list_collections_service(org_id, project_id)

    return json_util.dumps(collections), 200


@require_admin_api_key
def get_usages(org_id: str, project_id: str):
    result = get_cached_usage(project_id)

    return json_util.dumps(result), 200

@private_blueprint_project.route("<string:project_id>/assign_anon", methods=["POST"])
@require_admin_api_key
@requires_auth
def assign_anon_project_to_user(org_id: str, project_id: str):
    user_id = g.user_id
    data = request.get_json()
    
    if not data:
        return json_util.dumps({"error": "Request body is required"}), 400
    
    anon_project_id = data.get("anon_project_id")
    
    if not anon_project_id:
        return json_util.dumps({"error": "anon_project_id is required"}), 400

    check_project_permission(user_id, org_id, project_id)

    result = assign_anon_project_to_user_service(org_id, project_id, anon_project_id)
    
    return json_util.dumps({"message": result["message"]}), 200