import os
import certifi
from pymongo import MongoClient

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")
MONGO_COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME")
MONGO_EMAIL_COLLECTION = os.getenv("MONGO_EMAIL_COLLECTION")
MONGO_API_KEY_COLLECTION = os.getenv("MONGO_API_KEY_COLLECTION")
MONGO_ORGS = os.getenv("MONGO_ORGS")
MONGO_PROJECTS = os.getenv("MONGO_PROJECTS")
MONGO_COLLECTIONS = os.getenv("MONGO_COLLECTIONS")
MONGO_COLLECTION_DB = os.getenv("MONGO_COLLECTION_DB")

# Initialize MongoDB client
mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
mongo_db = mongo_client.get_database(MONGO_DB_NAME)
mongo_collection = mongo_db.get_collection(MONGO_COLLECTION_NAME)
mongo_email_collection = mongo_db.get_collection(MONGO_EMAIL_COLLECTION)
mongo_api_key_collection = mongo_db.get_collection(MONGO_API_KEY_COLLECTION)
mongo_orgs = mongo_db.get_collection(MONGO_ORGS)
mongo_projects = mongo_db.get_collection(MONGO_PROJECTS)
mongo_collections = mongo_db.get_collection(MONGO_COLLECTIONS)
mongo_collection_db = mongo_client.get_database(MONGO_COLLECTION_DB)
