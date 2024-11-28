from flask import Blueprint
from blueprints.v0.db.collection.document.routes import v0_blueprint_doc

v0_blueprint_collection = Blueprint(
    "v0_collection", __name__, url_prefix="/<string:db_id>/collection"
)

v0_blueprint_collection.register_blueprint(v0_blueprint_doc)
