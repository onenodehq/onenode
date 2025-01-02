from celery_setup import celery
from blueprints.v0.utils.mongo_setup import mongo_orgs
from bson import ObjectId
from utils.email import notify_admin
from datetime import datetime, timezone


@celery.task
def check_and_update_expired_plans():
    try:
        now = datetime.now(timezone.utc)
        query = {
            "plan.type": "paid",
            "plan.currentPeriodEnd": {"$lte": now},
            "plan.status": "active",
        }
        expired_plans = mongo_orgs.find(query)

        for org in expired_plans:
            customer_id = org.get("stripe_id")
            subscription_id = org["plan"].get("planId")

            if not customer_id or not subscription_id:
                error_message = f"Organization {ObjectId(org.get('_id'))} missing customer_id or subscription_id."
                notify_admin(subject="Expired Plan Update Error", body=error_message)
                continue

            # Update the plan to 'free'
            update_fields = {
                "plan.type": "free",
                "plan.status": "expired",  # Or any other appropriate status
            }

            result = mongo_orgs.update_one(
                {"stripe_id": customer_id}, {"$set": update_fields}
            )

            if not result.modified_count:
                error_message = f"Failed to update plan for customer {customer_id}."
                notify_admin(subject="Plan Update Failed", body=error_message)

    except Exception as e:
        error_message = f"Error in check_and_update_expired_plans: {str(e)}"
        notify_admin(
            subject="Critical Error in Scheduled Plan Update", body=error_message
        )
