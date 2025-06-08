from flask import Blueprint
from blueprints.v0.project.db.anon_routes import v0_blueprint_anon_db

v0_blueprint_anon_project = Blueprint(
    "v0_anon_project", __name__, url_prefix="/anon-project"
)

v0_blueprint_anon_project.register_blueprint(v0_blueprint_anon_db)