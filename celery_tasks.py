from bson import ObjectId
from blueprints.v0.utils.openai_operations import embed_text
from blueprints.v0.utils.pinecone_operations import pc_upsert
from celery_setup import celery
import datetime
import json
from blueprints.v0.utils.pinecone_operations import generate_pc_namespace
from blueprints.v0.utils.mongo_setup import (
    mongo_orgs,
    mongo_client_cluster,
    mongo_usage,
)
from blueprints.v0.utils.pinecone_setup import pc_client_index
from utils.email import notify_admin
from redis import Redis

# Initialize Redis connection using the same Redis instance as Celery broker
redis_client = Redis.from_url(celery.conf.broker_url)

CACHE_TTL = 86400  # 24 hours


@celery.task
def save_vectors_task(vector_bases: list, project_id_str: str, db_name):
    vectors = []
    for vector_basis in vector_bases:
        embedding = embed_text(vector_basis["values"])
        vector_basis.update({"values": embedding})
        vectors.append(vector_basis)
    pc_upsert(vectors, project_id_str, db_name)


def fetch_pinecone_usage(project_id_str: str, db_name: str) -> float:
    namespace = generate_pc_namespace(project_id_str, db_name)
    try:
        index_stats = pc_client_index.describe_index_stats()

        namespace_stats = (
            index_stats.get("namespaces", {}).get(namespace, {}).get("vector_count", 0)
        )

        # Estimate storage based on vector count (assuming 6KB per vector)
        storage_mb = (namespace_stats * 6) / 1024  # Convert KB to MB
        return round(storage_mb, 2)
    except Exception as e:
        notify_admin(
            "Usage Sampling Failed",
            f"Failed to fetch Pinecone stats for namespace {namespace}: {e}",
        )
        return 0.0


def cache_usage_data(usage_doc: dict):
    try:
        # Convert ObjectId to string for JSON serialization
        usage_doc["project_id"] = str(usage_doc["project_id"])
        usage_doc["org_id"] = str(usage_doc["org_id"])
        usage_doc["timestamp"] = str(usage_doc["timestamp"])

        serialized_data = json.dumps(usage_doc)

        # Primary cache key (persistent)
        project_key = f"usage:project:{usage_doc['project_id']}"

        # Store in primary cache (no expiration)
        redis_client.set(project_key, serialized_data, ex=CACHE_TTL)

    except Exception as e:
        notify_admin("Usage Caching Failed", f"Failed to cache usage data: {e}")


def get_cached_usage(project_id_str: str) -> dict:
    primary_key = f"usage:project:{project_id_str}"

    # Try primary cache first
    cached_data = redis_client.get(primary_key)

    # If both caches are empty, run check_usage and try again
    if cached_data is None:
        # Run check_usage (synchronously or via a Celery delay)
        # If you want it asynchronous, use check_usage.delay() instead.
        check_usage()

        # Attempt to retrieve from cache again
        cached_data = redis_client.get(primary_key)

    return json.loads(cached_data) if cached_data else None


@celery.task
def check_usage():
    current_time = datetime.datetime.now()
    usage_documents = []

    try:
        # ----------------------------------------------------------------------
        # A) Gather Usage Data
        # ----------------------------------------------------------------------
        orgs = mongo_orgs.find({})
        for org in orgs:
            org_name = org.get("name")

            for project in org.get("projects", []):
                project_id_str = str(project.get("_id"))
                project_name = project.get("name")

                total_project_mongo_storage = 0
                total_project_mongo_index = 0
                total_project_pinecone = 0
                database_details = []

                for collection in project.get("collections", []):
                    db_name = collection.get("db_name")
                    if db_name:
                        try:
                            # ---------------------
                            # MongoDB Stats
                            # ---------------------
                            db = mongo_client_cluster[db_name]
                            stats = db.command("dbStats")

                            mongo_storage_size = stats.get("storageSize", 0)
                            mongo_index_size = stats.get("indexSize", 0)

                            total_project_mongo_storage += mongo_storage_size
                            total_project_mongo_index += mongo_index_size

                            # ---------------------
                            # Pinecone Stats
                            # ---------------------
                            pinecone_usage = fetch_pinecone_usage(
                                project_id_str, db_name
                            )
                            total_project_pinecone += pinecone_usage

                            database_details.append(
                                {
                                    "db_name": db_name,
                                    "mongo_storage_mb": round(
                                        mongo_storage_size / (1024 * 1024), 2
                                    ),
                                    "mongo_index_mb": round(
                                        mongo_index_size / (1024 * 1024), 2
                                    ),
                                    "mongo_total_mb": round(
                                        (mongo_storage_size + mongo_index_size)
                                        / (1024 * 1024),
                                        2,
                                    ),
                                    "pinecone_mb": pinecone_usage,
                                }
                            )
                        except Exception as e:
                            notify_admin(
                                "Usage Sampling Failed",
                                f"Failed to fetch stats for {db_name} "
                                f"in project {project_id_str}: {e}",
                            )

                # ----------------------------------------------------------------
                # Prepare the usage document for this project
                # ----------------------------------------------------------------
                usage_doc = {
                    "timestamp": current_time.replace(second=0, microsecond=0),
                    "org_id": org.get("_id"),
                    "org_name": org_name,
                    "project_id": ObjectId(project_id_str),
                    "project_name": project_name,
                    "mongo_storage_mb": round(
                        total_project_mongo_storage / (1024 * 1024), 2
                    ),
                    "mongo_index_mb": round(
                        total_project_mongo_index / (1024 * 1024), 2
                    ),
                    "mongo_total_mb": round(
                        (total_project_mongo_storage + total_project_mongo_index)
                        / (1024 * 1024),
                        2,
                    ),
                    "pinecone_mb": round(total_project_pinecone, 2),
                    "database_details": database_details,
                }

                usage_documents.append(usage_doc)
                # Cache each usage document using project-level keys
                cache_usage_data(
                    usage_doc.copy()
                )  # Use copy to prevent modification of the original

        # ----------------------------------------------------------------------
        # B) Insert Usage Data Into mongo_usage
        # ----------------------------------------------------------------------
        if usage_documents:
            mongo_usage.insert_many(usage_documents)

    except Exception as e:
        notify_admin(
            "Usage Sampling Failed",
            f"An unexpected error occurred while checking usage: {e}",
        )
