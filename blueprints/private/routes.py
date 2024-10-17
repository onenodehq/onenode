from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from blueprints.private.rouvices import send_feedback_service
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


@private_v1_blueprint.route("/feedback", methods=["POST"])
@requires_auth
def send_feedback():
    email = g.email

    data = request.get_json()
    message = data.get("message")

    if not data or "message" not in data or not data["message"].strip():
        return jsonify({"error": "Missing 'message' parameter"}), 400

    send_feedback_service(email, message)
    return jsonify({"message": "success"}), 200
