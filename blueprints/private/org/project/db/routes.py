from flask import Blueprint
from blueprints.private.org.project.db.collection.routes import (
    private_blueprint_collection,
)

private_blueprint_db = Blueprint(
    "private_db",
    __name__,
    url_prefix="<string:project_id>/db",
)

private_blueprint_db.register_blueprint(private_blueprint_collection)
