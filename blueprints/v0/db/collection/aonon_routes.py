from flask import Blueprint
from blueprints.v0.utils.mongo_operations import split_db_id
from blueprints.v0.db.collection.services import delete_collection_service

v0_blueprint_collection_anon = Blueprint(
    "v0_collection_anon", __name__, url_prefix="/<string:db_id>/collection/anon"
)

@v0_blueprint_collection_anon.route("/<string:collection_name>", methods=["DELETE"])
def delete_collection_anon(db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)

    delete_collection_service(
        project_id,
        db_name,
        collection_name,
    )

    return "", 204