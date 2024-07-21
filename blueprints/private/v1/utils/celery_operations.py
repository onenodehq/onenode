""" import logging
from blueprints.v1.utils.celery_setup import celery

@celery.task
def test_redis_connection():
    try:
        print("test")
        return 'Connection successful!'
    except Exception as e:
        logging.error(f'Failed to connect to Redis: {e}') """