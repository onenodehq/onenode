import os
from pymongo import MongoClient


MONGO_CLIENT_URI = os.getenv("MONGO_CLIENT_URI")
mongo_client_cluster = MongoClient(MONGO_CLIENT_URI)
