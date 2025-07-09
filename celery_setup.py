import os
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

beat_schedule = {
    "record_usage_hourly": {
        "task": "celery_tasks.usage_tasks.record_usage",
        "schedule": crontab(minute=0),
    },
    "check_and_update_expired_plans": {
        "task": "celery_tasks.plan_tasks.check_and_update_expired_plans",
        "schedule": crontab(hour=0, minute=0),  # Every day at midnight
    },
    "cleanup_old_anon_projects": {
        "task": "celery_tasks.anon_tasks.cleanup_expired_anon_projects",
        "schedule": crontab(hour=2, minute=0, day_of_week=0),  # Every Sunday at 2:00 AM
    },
    "send_daily_admin_report": {
        "task": "celery_tasks.stats_tasks.send_daily_admin_report",
        "schedule": crontab(hour=8, minute=0),  # Every day at 8:00 AM UTC
    },
}

def make_celery(app):
    # In deployment, it automatically connects to SQS queue
    celery = Celery(
        app.import_name,
        include=["celery_tasks"],
    )

    celery.conf.update(
        broker_url=os.getenv("CELERY_BROKER_URL"),
        result_backend=os.getenv("CELERY_RESULT_BACKEND"),
        task_serializer="bson",
        accept_content=["bson", "json"],
        beat_schedule=beat_schedule,
    )

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


celery = make_celery(application)
