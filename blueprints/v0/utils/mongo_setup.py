import os
import certifi
from pymongo import MongoClient


MONGO_CLIENT_URI = os.getenv("MONGO_CLIENT_URI")
mongo_client_cluster = MongoClient(MONGO_CLIENT_URI, tlsCAFile=certifi.where())

MONGO_ADMIN_URI = os.getenv("MONGO_ADMIN_URI")
MONG0_FREE_STORAGE_LIMIT_MB = int(os.getenv("MONG0_FREE_STORAGE_LIMIT_MB"))
mongo_admin_cluster = MongoClient(MONGO_ADMIN_URI, tlsCAFile=certifi.where())
mongo_admin_db = mongo_admin_cluster.get_database("admin_db")
mongo_users = mongo_admin_db.get_collection("users")
mongo_api_keys = mongo_admin_db.get_collection("api_keys")
mongo_orgs = mongo_admin_db.get_collection("orgs")
mongo_usage = mongo_admin_db.get_collection("usage")
