import os
from flask import jsonify, request
import stripe
from blueprints.private.webhook.helpers import (
    handle_payment_failed,
    handle_payment_succeeded,
    handle_subscription_deleted,
    handle_subscription_updated,
)

# Set your secret key: remember to change this to your live secret key in production
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Your webhook secret, set in the Stripe dashboard
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


def stripe_webhook_service():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        # Invalid payload
        print("Invalid payload")
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print("Invalid signature")
        return jsonify({"error": "Invalid signature"}), 400

    # Handle the event
    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "invoice.payment_succeeded":
        print(data_object)
        handle_payment_succeeded(data_object)
    elif event_type == "customer.subscription.deleted":
        handle_subscription_deleted(data_object)
    elif event_type == "invoice.payment_failed":
        handle_payment_failed(data_object)

    return
