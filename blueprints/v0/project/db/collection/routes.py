from flask import Blueprint
from blueprints.v0.project.db.collection.document.routes import v0_blueprint_doc
from blueprints.v0.project.db.collection.services import delete_collection_service

v0_blueprint_collection = Blueprint(
    "v0_collection", __name__, url_prefix="/<string:db_name>/collection"
)

v0_blueprint_collection.register_blueprint(v0_blueprint_doc)

@v0_blueprint_collection.route("/<string:collection_name>", methods=["DELETE"])
def delete_collection(project_id: str, db_name: str, collection_name: str):

    delete_collection_service(
        project_id,
        db_name,
        collection_name,
    )

    return "", 204