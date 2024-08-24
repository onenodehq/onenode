import os
from dotenv import load_dotenv
from create_app import application
from celery import Celery

load_dotenv()


def make_celery(app):
    print("test\n\n", os.getenv("CELERY_RESULT_BACKEND"))
    celery = Celery(
        app.import_name,
        backend=os.getenv("CELERY_RESULT_BACKEND"),
        broker=os.getenv("CELERY_BROKER_URL"),
        include=["celery_tasks"],
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


celery = make_celery(application)
