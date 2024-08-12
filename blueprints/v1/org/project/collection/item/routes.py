from flask import Blueprint


v1_blueprint_item = Blueprint(
    "v1_item", __name__, url_prefix="/<string:collection_name>/item"
)


