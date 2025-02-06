from celery_setup import celery


@celery.task
def embed_image_task():
    pass
