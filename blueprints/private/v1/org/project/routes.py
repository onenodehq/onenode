from flask import Blueprint, g
from blueprints.private.v1.org.project.db.routes import (
    private_v1_blueprint_db,
)
from blueprints.private.v1.org.project.api_key.routes import (
    private_v1_blueprint_api_key,
)

private_v1_blueprint_project = Blueprint(
    "private_v1_project",
    __name__,
    url_prefix="<string:org_id>/project",
)

private_v1_blueprint_project.register_blueprint(private_v1_blueprint_db)
private_v1_blueprint_project.register_blueprint(private_v1_blueprint_api_key)
