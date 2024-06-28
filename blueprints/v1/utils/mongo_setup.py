import os
from pymongo import MongoClient

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")

# Initialize MongoDB client
mongo_client = MongoClient(MONGO_URI)
db = mongo_client.get_database("onenode_database_dev")
collection = db.get_collection("content_collection")