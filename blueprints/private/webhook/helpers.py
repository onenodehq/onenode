import os
from blueprints.v0.utils.mongo_setup import mongo_orgs
from datetime import datetime
import logging

from utils.email import notify_admin

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Product ID constants
STRIPE_MONTHLY_PRODUCT_ID = os.getenv(
    "STRIPE_MONTHLY_PRODUCT_ID"
)  # Replace with actual monthly product ID
STRIPE_ANNUAL_PRODUCT_ID = os.getenv(
    "STRIPE_ANNUAL_PRODUCT_ID"
)  # Replace with actual annual product ID


def update_plan_status(
    customer_id,
    subscription_id,
    status,
    current_period_end=None,
    subscription_period=None,
):
    try:
        if status == "active":
            plan_type = "paid"
        elif status in ["canceled", "unpaid", "past_due"]:
            plan_type = "free"
        else:
            plan_type = "free"

        update_fields = {
            "plan.plan_id": subscription_id,
            "plan.status": status,
            "plan.type": plan_type,
        }

        if current_period_end:
            update_fields["plan.current_period_end"] = datetime.fromtimestamp(
                current_period_end
            )

        if subscription_period:
            update_fields["plan.period"] = subscription_period

        result = mongo_orgs.update_one(
            {"stripe_id": customer_id}, {"$set": update_fields}
        )

        if result.matched_count:
            logger.info(
                f"Updated plan for customer {customer_id} with fields: {update_fields}"
            )
        else:
            error_message = (
                f"No organization found with Stripe customer ID {customer_id}."
            )
            logger.warning(error_message)
            notify_admin(subject="Plan Update Failed", body=error_message)

    except Exception as e:
        error_message = (
            f"Failed to update plan for customer {customer_id}. Error: {str(e)}"
        )
        logger.error(error_message)
        notify_admin(subject="Critical Error in Plan Update", body=error_message)


def handle_subscription_updated(subscription):
    try:
        customer_id = subscription.get("customer")
        subscription_id = subscription.get("id")
        status = subscription.get("status")
        current_period_end = subscription.get("current_period_end")
        items = subscription.get("items", {}).get("data", [])

        if not all([customer_id, subscription_id, status]):
            error_message = "Missing required subscription fields."
            logger.error(error_message)
            notify_admin(subject="Plan Update Failed", body=error_message)
            return

        # Get subscription period from the first item's price product
        subscription_period = None
        if items and items[0].get("price", {}).get("product"):
            product_id = items[0]["price"]["product"]
            subscription_period = (
                "monthly"
                if product_id == STRIPE_MONTHLY_PRODUCT_ID
                else "annual" if product_id == STRIPE_ANNUAL_PRODUCT_ID else None
            )

        update_plan_status(
            customer_id=customer_id,
            subscription_id=subscription_id,
            status=status,
            current_period_end=current_period_end,
            subscription_period=subscription_period,
        )

        logger.info(
            f"Plan updated for customer {customer_id} with status {status} and period {subscription_period}."
        )
    except Exception as e:
        error_message = f"Error handling plan update: {str(e)}"
        logger.error(error_message)
        notify_admin(subject="Critical Error in Plan Update", body=error_message)


def handle_subscription_deleted(subscription):
    try:
        customer_id = subscription.get("customer")
        subscription_id = subscription.get("id")
        status = subscription.get("status")

        if not all([customer_id, subscription_id, status]):
            error_message = "Missing required subscription fields."
            logger.error(error_message)
            notify_admin(subject="Plan Deletion Failed", body=error_message)
            return

        update_plan_status(
            customer_id=customer_id, subscription_id=subscription_id, status=status
        )

        logger.info(f"Plan deleted for customer {customer_id} with status {status}.")
    except Exception as e:
        error_message = f"Error handling plan deletion: {str(e)}"
        logger.error(error_message)
        notify_admin(subject="Critical Error in Plan Deletion", body=error_message)


def handle_payment_succeeded(invoice):
    try:
        customer_id = invoice.get("customer")
        subscription_id = invoice.get("subscription")
        amount_paid = invoice.get("amount_paid")
        subscription_details = invoice.get("lines", {}).get("data", [{}])
        current_period_end = subscription_details[0].get("period", {}).get("end")

        if not all([customer_id, subscription_id]):
            error_message = (
                "Missing required invoice fields (customer_id or subscription_id)."
            )
            logger.error(error_message)
            notify_admin(subject="Payment Succeeded Event Error", body=error_message)
            return

        # Get subscription period from the first line item's price product
        subscription_period = None
        if subscription_details and subscription_details[0].get("price", {}).get(
            "product"
        ):
            product_id = subscription_details[0]["price"]["product"]
            subscription_period = (
                "monthly"
                if product_id == STRIPE_MONTHLY_PRODUCT_ID
                else "annual" if product_id == STRIPE_ANNUAL_PRODUCT_ID else None
            )

        # Create or update subscription with active status
        update_plan_status(
            customer_id=customer_id,
            subscription_id=subscription_id,
            status="active",
            current_period_end=current_period_end,
            subscription_period=subscription_period,
        )

        logger.info(
            f"Subscription activated for customer {customer_id}, plan {subscription_id}, "
            f"period: {subscription_period}, amount_paid: {amount_paid}, current_period_end: {current_period_end}"
        )
    except Exception as e:
        error_message = f"Error handling payment success: {str(e)}"
        logger.error(error_message)
        notify_admin(
            subject="Critical Error in Payment Succeeded Handler", body=error_message
        )


def handle_payment_failed(invoice):
    try:
        customer_id = invoice.get("customer")
        subscription_id = invoice.get("subscription")
        attempt_count = invoice.get("attempt_count")

        if not customer_id:
            error_message = "Missing customer ID in invoice."
            logger.error(error_message)
            notify_admin(subject="Payment Failed Event Error", body=error_message)
            return

        if subscription_id:
            update_plan_status(
                customer_id=customer_id,
                subscription_id=subscription_id,
                status="past_due",
            )

        logger.warning(
            f"Payment failed for customer {customer_id}, plan {subscription_id}, attempt_count: {attempt_count}."
        )
    except Exception as e:
        error_message = f"Error handling payment failure: {str(e)}"
        logger.error(error_message)
        notify_admin(
            subject="Critical Error in Payment Failed Handler", body=error_message
        )
