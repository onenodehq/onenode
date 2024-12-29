from blueprints.v0.utils.openai_operations import embed_text
from blueprints.v0.utils.pinecone_operations import pc_upsert
from celery_setup import celery
import datetime
from blueprints.v0.utils.pinecone_operations import generate_pc_namespace
from blueprints.v0.utils.mongo_setup import (
    mongo_orgs,
    mongo_client_cluster,
    mongo_usage,
)
from blueprints.v0.utils.pinecone_setup import pc_client_index
from utils.email import notify_admin


@celery.task
def save_vectors_task(vector_bases: list, project_id: str, db_name):
    """
    Task that embeds text via OpenAI and upserts the resulting vectors into Pinecone.
    """
    vectors = []
    for vector_basis in vector_bases:
        embedding = embed_text(vector_basis["values"])
        vector_basis.update({"values": embedding})
        vectors.append(vector_basis)
    pc_upsert(vectors, project_id, db_name)


def fetch_pinecone_usage(project_id: str, db_name: str) -> float:
    """
    Fetch Pinecone storage usage for a given project and database namespace.
    Returns storage usage in MB.
    """
    try:
        namespace = generate_pc_namespace(project_id, db_name)
        index_stats = pc_client_index.describe_index_stats()

        namespace_stats = (
            index_stats.get("namespaces", {}).get(namespace, {}).get("vector_count", 0)
        )

        # Estimate storage based on vector count (assuming 1KB per vector)
        storage_mb = (namespace_stats * 1) / 1024  # Convert KB to MB
        return round(storage_mb, 2)
    except Exception as e:
        notify_admin(
            "Usage Sampling Failed",
            f"Failed to fetch Pinecone stats for namespace {namespace}: {e}",
        )
        return 0.0


@celery.task
def check_usage():
    """
    1. Checks storage usage (Mongo + Pinecone) across all orgs/projects.
    2. Stores usage data in Mongo.

    Celery Beat will handle scheduling this task every hour (or at your chosen interval).
    """
    current_time = datetime.datetime.now()
    usage_documents = []

    try:
        # ----------------------------------------------------------------------
        # A) Gather Usage Data
        # ----------------------------------------------------------------------
        orgs = mongo_orgs.find({})
        for org in orgs:
            org_id = org.get("_id")
            org_name = org.get("name")

            for project in org.get("projects", []):
                project_id = project.get("_id")
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
                            pinecone_usage = fetch_pinecone_usage(project_id, db_name)
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
                                f"in project {project_id}: {e}",
                            )

                # ----------------------------------------------------------------
                # Prepare the usage document for this project
                # ----------------------------------------------------------------
                usage_documents.append(
                    {
                        "timestamp": current_time.replace(second=0, microsecond=0),
                        "org_id": org_id,
                        "org_name": org_name,
                        "project_id": project_id,
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
                )

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
