from flask import Blueprint
from blueprints.v0.project.db.collection.services import delete_collection_service
from blueprints.v0.project.db.collection.document.anon_routes import v0_blueprint_anon_doc

v0_blueprint_anon_collection = Blueprint(
    "v0_anon_collection", __name__, url_prefix="<string:db_name>/collection"
)

v0_blueprint_anon_collection.register_blueprint(v0_blueprint_anon_doc)

@v0_blueprint_anon_collection.route("/<string:collection_name>", methods=["DELETE"])
def delete_collection_anon(project_id: str, db_name: str, collection_name: str):

    delete_collection_service(
        project_id,
        db_name,
        collection_name,
    )

    return "", 204