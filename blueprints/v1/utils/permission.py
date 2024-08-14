from bson import ObjectId


def has_permission(permissions, project_id, role):
    """
    Checks if the given project_id and role are in the permissions list.

    Args:
        permissions (list): List of dictionaries containing "project_id" and "role".
        project_id (str): The project_id to check.
        role (str): The role to check (should be one of ["owner", "editor", "viewer"]).

    Returns:
        bool: True if the project_id and role are in the permissions list, False otherwise.
    """
    return any(
        permission["project_id"] == ObjectId(project_id) and permission["role"] == role
        for permission in permissions
    )


def can_edit(permissions, project_id):
    """
    Checks if edit is allowed for the specified project_id.

    Args:
        permissions (list): List of dictionaries containing "project_id" and "role".
        project_id (str): The project_id to check.

    Returns:
        bool: True if edit is allowed (i.e., role is "owner" or "editor"), False otherwise.
    """
    return has_permission(permissions, project_id, "owner") or has_permission(
        permissions, project_id, "editor"
    )


def can_read(permissions, project_id):
    """
    Checks if read is allowed for the specified project_id.

    Args:
        permissions (list): List of dictionaries containing "project_id" and "role".
        project_id (str): The project_id to check.

    Returns:
        bool: True if read is allowed (i.e., role is "owner", "editor", or "viewer"), False otherwise.
    """
    return (
        has_permission(permissions, project_id, "owner")
        or has_permission(permissions, project_id, "editor")
        or has_permission(permissions, project_id, "viewer")
    )
