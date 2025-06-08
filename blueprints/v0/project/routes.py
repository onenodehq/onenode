from flask import Blueprint
from blueprints.v0.project.db.routes import v0_blueprint_db

v0_blueprint_project = Blueprint(
    "v0_project", __name__, url_prefix="/project"
)

v0_blueprint_project.register_blueprint(v0_blueprint_db)