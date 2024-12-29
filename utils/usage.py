import datetime
import os
import random
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from blueprints.v0.utils.pinecone_operations import generate_pc_namespace
from blueprints.v0.utils.mongo_setup import (
    mongo_orgs,
    mongo_client_cluster,
    mongo_usage,
)
from blueprints.v0.utils.pinecone_setup import pc_client_index
from utils.email import notify_admin

# Free Tier Configuration
FREE_MAIN_STORAGE_MB = os.getenv("FREE_MAIN_STORAGE_MB", 10240)
FREE_VECTOR_STORAGE_MB = os.getenv("FREE_VECTOR_STORAGE_MB", 10240)
FREE_REQUEST_NUMBER = os.getenv("FREE_REQUEST_NUMBER", 10000)

# Initialize Scheduler
scheduler = BackgroundScheduler()


def start_usage_scheduler():
    """
    Start the first job with a random minute within the current hour.
    """
    current_time = datetime.datetime.now()
    next_minute = random.randint(15, 16)
    next_run_time = current_time.replace(minute=next_minute, second=0, microsecond=0)
    scheduler.add_job(check_usage, trigger=DateTrigger(run_date=next_run_time))
    scheduler.start()


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

        # Estimate storage based on vector count (assuming 1KB per vector as an approximation)
        storage_mb = (namespace_stats * 1) / 1024  # Convert KB to MB
        return round(storage_mb, 2)
    except Exception as e:
        notify_admin(
            "Usage Sampling Failed",
            f"Failed to fetch Pinecone stats for namespace {namespace}: {e}",
        )
        return 0.0


def check_usage():
    """
    Check storage usage across all organizations and projects, including Pinecone usage,
    store data, and schedule the next run.
    """
    try:
        # Calculate next random time within the next hour
        current_time = datetime.datetime.now()
        next_minute = random.randint(0, 59)
        next_run_time = (current_time + datetime.timedelta(hours=1)).replace(
            minute=next_minute, second=0, microsecond=0
        )

        # Fetch all organizations
        orgs = mongo_orgs.find({})
        usage_documents = []

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
                            # MongoDB Stats
                            db = mongo_client_cluster[db_name]
                            stats = db.command("dbStats")

                            mongo_storage_size = stats.get("storageSize", 0)
                            mongo_index_size = stats.get("indexSize", 0)

                            total_project_mongo_storage += mongo_storage_size
                            total_project_mongo_index += mongo_index_size

                            # Pinecone Stats
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
                                f"Failed to fetch stats for {db_name} in project {project_id}: {e}",
                            )

                # Prepare the usage document for this project
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
                        "pinecone_mb": total_project_pinecone,
                        "database_details": database_details,
                    }
                )

        # Insert usage data into mongo_usage
        if usage_documents:
            try:
                mongo_usage.insert_many(usage_documents)
            except Exception as e:
                notify_admin(
                    "Usage Sampling Failed", f"Failed to insert usage data: {e}"
                )

        # Schedule the next run
        scheduler.add_job(check_usage, trigger=DateTrigger(run_date=next_run_time))

        notify_admin("Usage check completed.")
    except Exception as e:
        notify_admin(
            "Usage Sampling Failed",
            f"An unexpected error occurred while checking usage: {e}",
        )
