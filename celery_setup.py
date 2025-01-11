from dotenv import load_dotenv
from create_app import application
from celery import Celery
from celery.schedules import crontab
from bson import json_util

load_dotenv()

# Register bson as a serializer
from kombu.serialization import register

register(
    "bson",
    json_util.dumps,
    json_util.loads,
    content_type="application/bson",
    content_encoding="utf-8",
)


def make_celery(app):
    # In deployment, it automatically connects to SQS queue
    celery = Celery(
        app.import_name,
        include=["celery_tasks"],
    )

    celery.conf.update(
        task_serializer="bson",
        accept_content=["bson", "json"],
        beat_schedule={  # Configure beat schedule here
            "record_usage_hourly": {
                "task": "celery_tasks.record_usage",  # Update with your task path
                "schedule": crontab(minute=0),  # Every hour at minute 0
            },
            "check_and_update_expired_plans": {
                "task": "celery_tasks.check_and_update_expired_plans",
                "schedule": crontab(hour=0, minute=0),  # Every day at midnight
            },
        },
    )

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


celery = make_celery(application)
