import os
from pymongo import MongoClient

MONGO_CLIENT_URI = os.getenv("MONGO_CLIENT_URI", "mongodb://root:rootpassword@localhost:27017/")
mongo_client_cluster = MongoClient(MONGO_CLIENT_URI)
