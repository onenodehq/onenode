import os
import certifi
from pymongo import MongoClient


MONGO_ADMIN_URI = os.getenv("MONGO_ADMIN_URI")
MONGO_CLIENT_URI = os.getenv("MONGO_CLIENT_URI")
MONGO_ADMIN_DB = os.getenv("MONGO_ADMIN_DB")
MONGO_CONTENTS = os.getenv("MONGO_CONTENTS")
MONGO_USERS = os.getenv("MONGO_USERS")
MONGO_API_KEYS = os.getenv("MONGO_API_KEYS")
MONGO_ORGS = os.getenv("MONGO_ORGS")


mongo_admin_cluster = MongoClient(MONGO_ADMIN_URI, tlsCAFile=certifi.where())
mongo_client_cluster = MongoClient(MONGO_CLIENT_URI, tlsCAFile=certifi.where())
mongo_admin_db = mongo_admin_cluster.get_database(MONGO_ADMIN_DB)
mongo_contents = mongo_admin_db.get_collection(MONGO_CONTENTS)
mongo_users = mongo_admin_db.get_collection(MONGO_USERS)
mongo_api_keys = mongo_admin_db.get_collection(MONGO_API_KEYS)
mongo_orgs = mongo_admin_db.get_collection(MONGO_ORGS)
mongo_usage = mongo_admin_db.get_collection("usage")
