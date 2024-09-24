from flask import Blueprint
from blueprints.v1.db.collection.document.routes import v1_blueprint_doc

v1_blueprint_collection = Blueprint(
    "v1_collection", __name__, url_prefix="/<string:db_id>/collection"
)

v1_blueprint_collection.register_blueprint(v1_blueprint_doc)
