from flask import Blueprint
from blueprints.v1.db.collection.routes import v1_blueprint_collection

v1_blueprint_db = Blueprint(
    "v1_db", __name__, url_prefix="/db"
)

v1_blueprint_db.register_blueprint(v1_blueprint_collection)
