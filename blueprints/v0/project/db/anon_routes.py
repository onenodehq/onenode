from flask import Blueprint
from blueprints.v0.project.db.collection.aonon_routes import v0_blueprint_anon_collection

v0_blueprint_anon_db = Blueprint(
    "v0_anon_db", __name__, url_prefix="/<string:project_id>/db"
)

v0_blueprint_anon_db.register_blueprint(v0_blueprint_anon_collection)