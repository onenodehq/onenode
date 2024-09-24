from flask import Blueprint
from blueprints.v1.org.routes import v1_blueprint_org
from blueprints.v1.db.routes import v1_blueprint_db


v1_blueprint_root = Blueprint("v1_root", __name__, url_prefix="/v1")

v1_blueprint_root.register_blueprint(v1_blueprint_org)
v1_blueprint_root.register_blueprint(v1_blueprint_db)
