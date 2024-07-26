import os
import certifi
from pymongo import MongoClient

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")
MONGO_COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME")
MONGO_EMAIL_COLLECTION = os.getenv("MONGO_EMAIL_COLLECTION")

# Initialize MongoDB client
mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
mongo_db = mongo_client.get_database(MONGO_DB_NAME)
mongo_collection = mongo_db.get_collection(MONGO_COLLECTION_NAME)
mongo_email_collection = mongo_db.get_collection(MONGO_EMAIL_COLLECTION)