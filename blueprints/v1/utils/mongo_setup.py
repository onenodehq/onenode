import os
import certifi
from pymongo import MongoClient

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")
MONGO_CONTENTS = os.getenv("MONGO_CONTENTS")
MONGO_EMAILS = os.getenv("MONGO_EMAILS")
MONGO_API_KEYS = os.getenv("MONGO_API_KEYS")
MONGO_ORGS = os.getenv("MONGO_ORGS")
MONGO_PROJECTS = os.getenv("MONGO_PROJECTS")
MONGO_COLLECTIONS = os.getenv("MONGO_COLLECTIONS")
MONGO_CLIENT_DB = os.getenv("MONGO_CLIENT_DB")

# Initialize MongoDB client
mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
mongo_db = mongo_client.get_database(MONGO_DB_NAME)
mongo_contents = mongo_db.get_collection(MONGO_CONTENTS)
mongo_emails = mongo_db.get_collection(MONGO_EMAILS)
mongo_api_keys = mongo_db.get_collection(MONGO_API_KEYS)
mongo_orgs = mongo_db.get_collection(MONGO_ORGS)
mongo_projects = mongo_db.get_collection(MONGO_PROJECTS)
mongo_collections = mongo_db.get_collection(MONGO_COLLECTIONS)
mongo_client_db = mongo_client.get_database(MONGO_CLIENT_DB)
