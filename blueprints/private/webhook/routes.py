from flask import Blueprint, request, jsonify
from blueprints.private.webhook.services import stripe_webhook_service

private_webhook_blueprint = Blueprint(
    "webhook",
    __name__,
    url_prefix="/webhook",
)


@private_webhook_blueprint.route("/stripe", methods=["POST"])
def stripe_webhook():
    stripe_webhook_service()

    return jsonify({"status": "success"}), 200
