from flask import Blueprint
from blueprints.v1.project.collection.routes import v1_blueprint_collection

v1_blueprint_project = Blueprint(
    "v1_project", __name__, url_prefix="/project"
)

v1_blueprint_project.register_blueprint(v1_blueprint_collection)
