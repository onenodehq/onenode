from os import abort
from blueprints.v0.utils.mongo_operations import get_client_db
from blueprints.v0.utils.mongo_setup import MONG0_FREE_STORAGE_LIMIT_MB
from blueprints.v0.utils.pinecone_operations import generate_pc_namespace
from blueprints.v0.utils.pinecone_setup import (
    PC_FREE_STORAGE_LIMIT_MB,
    pc_client_index,
)


def check_mongo_storage(project_id: str, db_name: str):
    # NOTE: Currently this doesn't consider document size that is being added.
    # Maybe necessary in the future.
    db = get_client_db(project_id, db_name)
    stats = db.command("dbstats", scale=1024 * 1024)  # in MB
    total_size_mb = stats["storageSize"] + stats["indexSize"]

    # Check if total storage is greater than 10MB (10 * 1024 * 1024 bytes)
    if total_size_mb > MONG0_FREE_STORAGE_LIMIT_MB:
        abort(
            403,
            description=f"Storage limit exceeded. Total size is over {MONG0_FREE_STORAGE_LIMIT_MB} MB.",
        )
    return


def check_pc_storage(project_id: str, db_name: str):
    namespace = generate_pc_namespace(project_id, db_name)
    stats = pc_client_index.describe_index_stats()
    dimension = stats.get("dimension", 0)
    namespaces = stats.get("namespaces", {})
    vector_count = namespaces.get(namespace, {}).get("vector_count", 0)

    vector_size_bytes = dimension * 4
    vector_size_mb = vector_size_bytes / (1024 * 1024)  # Convert to MB
    if vector_count * vector_size_mb > PC_FREE_STORAGE_LIMIT_MB:
        abort(
            403,
            description=f"Vector storage limit exceeded. Total size is over {PC_FREE_STORAGE_LIMIT_MB} MB.",
        )
    return
