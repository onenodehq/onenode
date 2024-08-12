from flask import Blueprint
from blueprints.v1.org.project.routes import v1_blueprint_project

v1_blueprint_org = Blueprint("v1_org", __name__, url_prefix="/org")

v1_blueprint_org.register_blueprint(v1_blueprint_project)
