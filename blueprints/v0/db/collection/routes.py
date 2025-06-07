from flask import Blueprint
from auth.api_key_decorator import require_api_key
from blueprints.v0.db.collection.document.routes import v0_blueprint_doc
from blueprints.v0.utils.api_key_permissions import check_api_key_permissions
from blueprints.v0.utils.mongo_operations import split_db_id
from blueprints.v0.db.collection.services import delete_collection_service
from blueprints.v0.db.collection.aonon_routes import v0_blueprint_collection_anon

v0_blueprint_collection = Blueprint(
    "v0_collection", __name__, url_prefix="/<string:db_id>/collection"
)

v0_blueprint_collection.register_blueprint(v0_blueprint_doc)
v0_blueprint_collection.register_blueprint(v0_blueprint_collection_anon)

@v0_blueprint_collection.route("/<string:collection_name>", methods=["DELETE"])
@require_api_key
def delete_collection(permissions: list[dict], db_id: str, collection_name: str):
    project_id, db_name = split_db_id(db_id)
    check_api_key_permissions(permissions, project_id)

    delete_collection_service(
        project_id,
        db_name,
        collection_name,
    )

    return "", 204