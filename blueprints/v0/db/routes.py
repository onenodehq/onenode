from flask import Blueprint
from blueprints.v0.db.collection.routes import v0_blueprint_collection

v0_blueprint_db = Blueprint(
    "v0_db", __name__, url_prefix="/db"
)

v0_blueprint_db.register_blueprint(v0_blueprint_collection)
