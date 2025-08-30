import os
from dotenv import load_dotenv
from create_app import application
from celery import Celery
from bson import json_util

load_dotenv()

from kombu.serialization import register

register(
    "bson",
    json_util.dumps,
    json_util.loads,
    content_type="application/bson",
    content_encoding="utf-8",
)

def make_celery(app):
    celery = Celery(
        app.import_name,
        include=["celery_tasks"],
    )

    celery.conf.update(
        broker_url="redis://redis:6379/0",
        result_backend="redis://redis:6379/0",
        task_serializer="bson",
        accept_content=["bson", "json"],
    )

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


celery = make_celery(application)
