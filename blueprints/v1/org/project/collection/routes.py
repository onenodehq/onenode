from flask import Blueprint
from blueprints.v1.org.project.collection.item.routes import v1_blueprint_item

v1_blueprint_collection = Blueprint(
    "v1_collection", __name__, url_prefix="/<string:project_id>/collection"
)

v1_blueprint_collection.register_blueprint(v1_blueprint_item)
