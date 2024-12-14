from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_onenode_auth
from blueprints.private.services import send_feedback_service
from blueprints.private.onenode.question import private_onenode_blueprint_question
from blueprints.private.onenode.resource import private_onenode_blueprint_resource
from blueprints.private.onenode.user.routes import private_onenode_blueprint_user

private_onenode_blueprint = Blueprint(
    "private_onenode",
    __name__,
    url_prefix="/onenode",
)
private_onenode_blueprint.register_blueprint(private_onenode_blueprint_question)
private_onenode_blueprint.register_blueprint(private_onenode_blueprint_resource)
private_onenode_blueprint.register_blueprint(private_onenode_blueprint_user)


@private_onenode_blueprint.route("/feedback", methods=["POST"])
@requires_onenode_auth
def send_feedback():
    user_id = g.user_id

    data = request.get_json()
    message = data.get("message")

    if not data or "message" not in data or not data["message"].strip():
        return jsonify({"error": "Missing 'message' parameter"}), 400

    send_feedback_service(user_id, message)
    return jsonify({"message": "success"}), 200
