from flask import Blueprint
from blueprints.v0.project.routes import v0_blueprint_project

v0_blueprint_root = Blueprint("v0_root", __name__, url_prefix="/v0")

v0_blueprint_root.register_blueprint(v0_blueprint_project)