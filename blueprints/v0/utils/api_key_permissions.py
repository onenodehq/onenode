from bson import ObjectId
from flask import abort


def check_api_key_permissions(
    permissions: dict, project_id: str, role: str = "owner"
) -> bool:
    projects = permissions.get("projects", [])
    if (
        projects
        and projects[0].get("_id") == ObjectId(project_id)
        and projects[0].get("role") == role
    ):
        return True
    abort(403, description="API key denied. Insufficient permissions.")
