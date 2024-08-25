from celery_setup import celery
from blueprints.v1.utils.mongo_setup import mongo_client_db


@celery.task
def example_task():
    # Process your task here
    collection = mongo_client_db.get_collection("index")
    collection.insert_one(document={"key1": "Celery test 02"})
    return
