from flask import Blueprint
from blueprints.private.v1.question import private_v1_blueprint_question
from blueprints.private.v1.resource import private_v1_blueprint_resource
from blueprints.private.v1.org.routes import private_v1_blueprint_org
from blueprints.private.v1.onenode_id.routes import private_v1_blueprint_user

private_v1_blueprint = Blueprint(
    "private",
    __name__,
    url_prefix="/private",
)
private_v1_blueprint.register_blueprint(private_v1_blueprint_question)
private_v1_blueprint.register_blueprint(private_v1_blueprint_resource)
private_v1_blueprint.register_blueprint(private_v1_blueprint_org)
private_v1_blueprint.register_blueprint(private_v1_blueprint_user)
