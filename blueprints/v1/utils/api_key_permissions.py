import os
from bson import ObjectId
from errors import AuthError

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
    raise AuthError("API key denied. Insufficient permissions.")
