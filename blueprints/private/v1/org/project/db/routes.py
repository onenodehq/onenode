from flask import Blueprint
from blueprints.private.v1.org.project.db.collection.routes import (
    private_v1_blueprint_collection,
)

private_v1_blueprint_db = Blueprint(
    "private_v1_db",
    __name__,
    url_prefix="<string:project_id>/db",
)

private_v1_blueprint_db.register_blueprint(private_v1_blueprint_collection)


""" @private_v1_blueprint_db.route("/<string:db_id>", methods=["GET"])
@requires_auth
def list_collections(org_id, project_id, db_id):
    onenode_id = g.onenode_id

    check_permission(onenode_id=onenode_id, project_id=project_id)

    collections = list_collections_service(project_id=project_id)

    return json_util.dumps(collections), 200
 """

## db_name should not have spaces