from flask import Blueprint
from blueprints.private.v1.org.project.db.collection.routes import (
    private_v1_blueprint_collection,
)

private_v1_blueprint_db = Blueprint(
    "private_v1_db",
    __name__,
    url_prefix="<string:project_id>/db",
)

private_v1_blueprint_db.register_blueprint(private_v1_blueprint_collection)
