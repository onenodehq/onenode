import os
import certifi
from pymongo import MongoClient

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")

# Initialize MongoDB client
mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
mongo_db = mongo_client.get_database("onenode_database_dev")
mongo_collection = mongo_db.get_collection("content_collection")