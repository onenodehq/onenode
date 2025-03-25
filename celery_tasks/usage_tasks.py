from blueprints.v0.utils.mongo_operations import generate_client_db_id
from celery_setup import celery
from blueprints.v0.utils.pinecone_operations import (
    fetch_pinecone_usage,
    fetch_pinecone_usage_for_collection,
)
from blueprints.v0.utils.mongo_setup import (
    mongo_orgs,
    mongo_client_cluster,
    mongo_usage,
)
from utils.email import notify_admin
from redis import Redis
import datetime
import json
from bson import ObjectId
from bson import BSON

redis_client = Redis.from_url(celery.conf.broker_url)
CACHE_TTL = 86400  # 24 hours


def cache_usage_data(usage_doc: dict):
    try:
        usage_doc["project_id"] = str(usage_doc["project_id"])
        usage_doc["org_id"] = str(usage_doc["org_id"])
        usage_doc["timestamp"] = str(usage_doc["timestamp"])

        serialized_data = json.dumps(usage_doc)
        project_key = f"usage:project:{usage_doc['project_id']}"
        redis_client.set(project_key, serialized_data, ex=CACHE_TTL)
    except Exception as e:
        notify_admin("Usage Caching Failed", f"Failed to cache usage data: {e}")


def get_cached_usage(project_id_str: str) -> dict:
    primary_key = f"usage:project:{project_id_str}"
    cached_data = redis_client.get(primary_key)

    if cached_data is None:
        #record_usage()  # Trigger the usage recording task
        #cached_data = redis_client.get(primary_key)
        pass # NOTE Need to be updated

    return json.loads(cached_data) if cached_data else None


@celery.task
def record_usage():
    current_time = datetime.datetime.now()
    usage_documents = []

    try:        
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
                    if not db_name:
                        continue
                    db_id = generate_client_db_id(project_id_str, db_name)

                    try:
                        db = mongo_client_cluster[db_id]
                        stats = db.command("dbStats")

                        mongo_storage_size = stats.get("storageSize", 0)
                        mongo_index_size = stats.get("indexSize", 0)

                        total_project_mongo_storage += mongo_storage_size
                        total_project_mongo_index += mongo_index_size

                        pinecone_usage = fetch_pinecone_usage(project_id_str, db_name)
                        total_project_pinecone += pinecone_usage

                        collection_details = []
                        for coll_name in db.list_collection_names():
                            coll_stats = db.command({"collStats": coll_name})
                            coll_size = coll_stats.get("size", 0)
                            coll_idx_size = coll_stats.get("totalIndexSize", 0)
                            doc_count = coll_stats.get("count", 0)

                            pc_mb = fetch_pinecone_usage_for_collection(
                                project_id_str, db_name, coll_name
                            )

                            # Calculate average (storage + index) per document
                            if doc_count > 0:
                                avg_doc_bytes = (coll_size + coll_idx_size) / doc_count
                                avg_doc_mb = round(avg_doc_bytes / (1024 * 1024), 4)
                                avg_pc_mb = pc_mb / doc_count
                            else:
                                avg_doc_mb = 0.0
                                avg_pc_mb = 0.0

                            collection_details.append(
                                {
                                    "collection_name": coll_name,
                                    "document_count": doc_count,
                                    "storage_mb": round(coll_size / (1024 * 1024), 2),
                                    "index_mb": round(coll_idx_size / (1024 * 1024), 2),
                                    "total_mb": round(
                                        (coll_size + coll_idx_size) / (1024 * 1024), 2
                                    ),
                                    "avg_doc_mb": avg_doc_mb,
                                    "pc_mb": pc_mb,
                                    "avg_pc_mb": avg_pc_mb,
                                }
                            )

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
                                "pc_mb": round(pinecone_usage, 2),
                                "collection_details": collection_details,
                            }
                        )

                    except Exception as e:
                        notify_admin(
                            "Usage Sampling Failed",
                            f"Failed to fetch stats for {db_name} "
                            f"in project {project_id_str}: {e}",
                        )

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
                    "pc_mb": round(total_project_pinecone, 2),
                    "database_details": database_details,
                }

                usage_documents.append(usage_doc)
                cache_usage_data(usage_doc.copy())

        if usage_documents:
            mongo_usage.insert_many(usage_documents)

    except Exception as e:
        notify_admin(
            "Usage Sampling Failed",
            f"An unexpected error occurred while checking usage: {e}",
        )


def increment_collection_usage_cache(
    project_id_str: str,
    db_name: str,
    collection_name: str,
    inserted_documents: list[dict],
    total_vector_dimensions: int,
):
    try:
        usage_doc = get_cached_usage(project_id_str)
        if not usage_doc:
            notify_admin(
                "Cache Miss",
                f"No cached usage document found for project {project_id_str}. "
                f"Cannot update usage after save.",
            )
            return

        # 1. Locate the correct DB and collection in the usage document
        db_detail_list = usage_doc.get("database_details", [])
        db_detail = next(
            (db for db in db_detail_list if db.get("db_name") == db_name), None
        )
        if not db_detail:
            notify_admin(
                "Database Not Found",
                f"No database '{db_name}' found in usage cache for project {project_id_str}.",
            )
            return

        coll_detail_list = db_detail.get("collection_details", [])
        coll_detail = next(
            (
                c
                for c in coll_detail_list
                if c.get("collection_name") == collection_name
            ),
            None,
        )
        if not coll_detail:
            notify_admin(
                "Collection Not Found",
                f"No collection '{collection_name}' found in usage cache for project {project_id_str}.",
            )
            return

        # 2. Calculate actual Mongo doc size in bytes, then MB
        total_new_docs_bytes = 0
        for doc in inserted_documents:
            # Example: encode to BSON and measure size
            total_new_docs_bytes += len(BSON.encode(doc))

        total_new_docs_mb = round(total_new_docs_bytes / (1024 * 1024), 4)

        # 3. Calculate Pinecone usage (bytes -> MB)
        #    Assume 4 bytes per dimension
        total_vector_bytes = total_vector_dimensions * 4
        total_vector_mb = round(total_vector_bytes / (1024 * 1024), 4)

        # 4. Update collection-level stats
        current_doc_count = coll_detail.get("document_count", 0)
        new_doc_count = current_doc_count + len(inserted_documents)

        coll_detail["document_count"] = new_doc_count
        coll_detail["total_mb"] = round(
            coll_detail.get("total_mb", 0.0) + total_new_docs_mb, 2
        )
        coll_detail["pc_mb"] = round(coll_detail.get("pc_mb", 0.0) + total_vector_mb, 2)

        # 5. Update DB-level usage
        db_detail["mongo_total_mb"] = round(
            db_detail.get("mongo_total_mb", 0.0) + total_new_docs_mb, 2
        )
        db_detail["pc_mb"] = round(db_detail.get("pc_mb", 0.0) + total_vector_mb, 2)

        # 6. Update project-level usage
        usage_doc["mongo_total_mb"] = round(
            usage_doc.get("mongo_total_mb", 0.0) + total_new_docs_mb, 2
        )
        usage_doc["pc_mb"] = round(usage_doc.get("pc_mb", 0.0) + total_vector_mb, 2)

        # 7. Re-cache the updated usage doc
        cache_usage_data(usage_doc)

    except Exception as e:
        notify_admin(
            "Cache Update Failed [Save]",
            f"Failed to update usage cache (SAVE) for project {project_id_str}, "
            f"db {db_name}, collection {collection_name}: {e}",
        )


@celery.task
def decrement_collection_usage_cache(
    project_id_str: str,
    db_name: str,
    collection_name: str,
    doc_delta: int,
):
    try:
        usage_doc = get_cached_usage(project_id_str)
        if not usage_doc:
            notify_admin(
                "Cache Miss",
                f"No cached usage document found for project {project_id_str}. "
                f"Cannot update usage after delete.",
            )
            return

        # Find DB
        db_details = usage_doc.get("database_details", [])
        db_detail = next(
            (db for db in db_details if db.get("db_name") == db_name), None
        )
        if not db_detail:
            notify_admin(
                "Database Not Found",
                f"No database '{db_name}' found in usage cache for project {project_id_str}.",
            )
            return

        # Find collection
        coll_details = db_detail.get("collection_details", [])
        coll_detail = next(
            (c for c in coll_details if c.get("collection_name") == collection_name),
            None,
        )
        if not coll_detail:
            notify_admin(
                "Collection Not Found",
                f"No collection '{collection_name}' found in usage cache for project {project_id_str}.",
            )
            return

        current_doc_count = coll_detail.get("document_count", 0)
        avg_mongo_per_doc = coll_detail.get("avg_doc_mb", 0.0)  # (storage + index)
        avg_pinecone_per_doc = coll_detail.get("avg_pc_mb", 0.0)

        # Prevent negative doc_count
        if doc_delta > current_doc_count:
            doc_delta = current_doc_count

        new_doc_count = current_doc_count - doc_delta

        # Calculate the approximate MB usage to remove
        mongo_delta_mb = avg_mongo_per_doc * doc_delta
        pinecone_delta_mb = avg_pinecone_per_doc * doc_delta

        # Update the collection-level stats
        coll_detail["document_count"] = new_doc_count
        coll_detail["total_mb"] = round(
            coll_detail.get("total_mb", 0.0) - mongo_delta_mb, 2
        )
        coll_detail["pc_mb"] = round(
            coll_detail.get("pc_mb", 0.0) - pinecone_delta_mb, 2
        )
        if coll_detail["total_mb"] < 0:
            coll_detail["total_mb"] = 0
        if coll_detail["pc_mb"] < 0:
            coll_detail["pc_mb"] = 0

        # Update DB-level usage
        db_detail["mongo_total_mb"] = round(
            db_detail.get("mongo_total_mb", 0.0) - mongo_delta_mb,
            2,
        )
        db_detail["pc_mb"] = round(
            db_detail.get("pc_mb", 0.0) - pinecone_delta_mb,
            2,
        )
        if db_detail["mongo_total_mb"] < 0:
            db_detail["mongo_total_mb"] = 0
        if db_detail["pc_mb"] < 0:
            db_detail["pc_mb"] = 0

        # Update project-level usage
        usage_doc["mongo_total_mb"] = round(
            usage_doc.get("mongo_total_mb", 0.0) - mongo_delta_mb,
            2,
        )
        usage_doc["pc_mb"] = round(
            usage_doc.get("pc_mb", 0.0) - pinecone_delta_mb,
            2,
        )
        if usage_doc["mongo_total_mb"] < 0:
            usage_doc["mongo_total_mb"] = 0
        if usage_doc["pc_mb"] < 0:
            usage_doc["pc_mb"] = 0

        # Save updated usage doc back to cache
        cache_usage_data(usage_doc)

    except Exception as e:
        notify_admin(
            "Cache Update Failed [Delete]",
            f"Failed to update usage cache (DELETE) for project {project_id_str}, "
            f"db {db_name}, collection {collection_name}: {e}",
        )
