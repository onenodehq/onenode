from flask import Blueprint
from blueprints.v1.org.project.collection.routes import v1_blueprint_collection

v1_blueprint_project = Blueprint(
    "v1_project", __name__, url_prefix="/<string:org_id>/project"
)

v1_blueprint_project.register_blueprint(v1_blueprint_collection)
