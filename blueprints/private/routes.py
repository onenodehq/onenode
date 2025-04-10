from flask import Blueprint, g, jsonify, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from blueprints.private.services import (
    send_docs_feedback_service,
    send_feedback_service,
)
from blueprints.private.org.routes import private_blueprint_org
from blueprints.private.user.routes import private_blueprint_user
from blueprints.private.webhook.routes import private_webhook_blueprint
from utils.email import notify_admin

private_blueprint = Blueprint(
    "private",
    __name__,
    url_prefix="/private",
)
private_blueprint.register_blueprint(private_blueprint_org)
private_blueprint.register_blueprint(private_blueprint_user)
private_blueprint.register_blueprint(private_webhook_blueprint)


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


@private_blueprint.route("/docs-feedback", methods=["POST"])
@require_admin_api_key
def send_docs_feedback():
    data = request.get_json()
    message = data.get("message")

    if not data or "message" not in data or not data["message"].strip():
        return jsonify({"error": "Missing 'message' parameter"}), 400

    send_docs_feedback_service(message)
    return jsonify({"message": "success"}), 200


@private_blueprint.route("/notify-admin", methods=["POST"])
@require_admin_api_key
def send_admin_notification():
    data = request.get_json()
    subject = data.get("subject")
    body = data.get("body")

    if not subject or not body:
        return jsonify({"error": "Missing 'subject' or 'body' parameter"}), 400

    notify_admin(subject, body)
    return jsonify({"message": "success"}), 200
