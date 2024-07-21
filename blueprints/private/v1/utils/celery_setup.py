""" import os
from celery import Celery
from create_app import application
from dotenv import load_dotenv

load_dotenv()

REDIS_ENDPOINT_URL = os.getenv("REDIS_ENDPOINT_URL")

def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=REDIS_ENDPOINT_URL,  # Changed to `backend` from `result_backend` for clarity
        broker=REDIS_ENDPOINT_URL,
    )
    print("celery", celery.backend)
    app.config['result_backend'] = REDIS_ENDPOINT_URL  # Use 'result_backend' instead of 'CELERY_RESULT_BACKEND'

    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery(application) """