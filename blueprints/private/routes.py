from flask import Blueprint, g, jsonify, request
from auth.auth_decorator import requires_auth
from blueprints.private.services import send_feedback_service
from blueprints.private.org.routes import private_blueprint_org
from blueprints.private.user.routes import private_blueprint_user
from blueprints.private.onenode.routes import private_onenode_blueprint

private_blueprint = Blueprint(
    "private",
    __name__,
    url_prefix="/private",
)
private_blueprint.register_blueprint(private_blueprint_org)
private_blueprint.register_blueprint(private_blueprint_user)
private_blueprint.register_blueprint(private_onenode_blueprint)


@private_blueprint.route("/feedback", methods=["POST"])
@requires_auth
def send_feedback():
    user_id = g.user_id

    data = request.get_json()
    message = data.get("message")

    if not data or "message" not in data or not data["message"].strip():
        return jsonify({"error": "Missing 'message' parameter"}), 400

    send_feedback_service(user_id, message)
    return jsonify({"message": "success"}), 200
