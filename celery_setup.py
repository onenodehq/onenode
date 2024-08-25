from dotenv import load_dotenv
from create_app import application
from celery import Celery

load_dotenv()


def make_celery(app):
    # In deployment, it automatically connects to SQS queue
    celery = Celery(
        app.import_name,
        include=["celery_tasks"],
    )

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


celery = make_celery(application)
