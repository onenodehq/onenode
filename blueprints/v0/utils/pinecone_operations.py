from itertools import islice
from blueprints.v0.utils.pinecone_setup import (
    pc_index_1536,
    pc_index_3072,
)
from logger import logger

# helper
def batch_iterable(iterable, batch_size):
    it = iter(iterable)
    while True:
        batch = list(islice(it, batch_size))
        if not batch:
            break
        yield batch


def pc_delete_with_doc_ids(
    project_id: str, db_name: str, collection_name: str, doc_ids: list[str]
):
    namespace = generate_pc_namespace(project_id, db_name)
    ids_to_delete_1536 = []
    ids_to_delete_3072 = []
    for doc_id in doc_ids:
        prefix = generate_pc_id_prefix(project_id, db_name, collection_name, doc_id)
        for ids in pc_index_1536.list(prefix=prefix, namespace=namespace):
            ids_to_delete_1536.extend(ids)

        for ids in pc_index_3072.list(prefix=prefix, namespace=namespace):
            ids_to_delete_3072.extend(ids)

    batch_size = 1000  # Pinecone delete batch limit is 1,000
    if ids_to_delete_1536:
        for batch in batch_iterable(ids_to_delete_1536, batch_size):
            pc_index_1536.delete(ids=batch, namespace=namespace)
    if ids_to_delete_3072:
        for batch in batch_iterable(ids_to_delete_3072, batch_size):
            pc_index_3072.delete(ids=batch, namespace=namespace)


def create_vector_bases(
    chunks: list[str],
    metadata: dict,
    project_id: str,
    db_name: str,
    collection_name: str,
    doc_id: str,
    path: str,
) -> list:
    vector_bases = []
    for i, chunk in enumerate(chunks):
        vector_basis = {
            "id": generate_pc_id(
                project_id,
                db_name,
                collection_name,
                doc_id,
                path,
                i,
            ),
            "values": chunk,
            "metadata": metadata,
        }
        vector_bases.append(vector_basis)
    return vector_bases


def pc_upsert(vectors: list, project_id: str, db_name: str, dimensions: int):
    namespace = generate_pc_namespace(project_id, db_name)
    if dimensions == 1536:
        result = pc_index_1536.upsert(vectors=vectors, namespace=namespace)
        return result
    elif dimensions == 3072:
        result = pc_index_3072.upsert(vectors=vectors, namespace=namespace)
        return result


def pc_client_delete_collection(project_id: str, db_name: str, collection_name: str):
    namespace = generate_pc_namespace(project_id, db_name)
    collection_prefix = generate_pc_id_prefix(project_id, db_name, collection_name)
    ids_to_delete_1536 = []
    ids_to_delete_3072 = []
    
    # Check if namespace exists in 1536 index
    index_stats_1536 = pc_index_1536.describe_index_stats()
    namespace_exists_1536 = namespace in index_stats_1536.get("namespaces", {})
    
    # Check if namespace exists in 3072 index
    index_stats_3072 = pc_index_3072.describe_index_stats()
    namespace_exists_3072 = namespace in index_stats_3072.get("namespaces", {})
    
    if namespace_exists_1536:
        for ids in pc_index_1536.list(prefix=collection_prefix, namespace=namespace):
            ids_to_delete_1536.extend(ids)
        if ids_to_delete_1536:
            pc_index_1536.delete(ids=ids_to_delete_1536, namespace=namespace)
    
    if namespace_exists_3072:
        for ids in pc_index_3072.list(prefix=collection_prefix, namespace=namespace):
            ids_to_delete_3072.extend(ids)
        if ids_to_delete_3072:
            pc_index_3072.delete(ids=ids_to_delete_3072, namespace=namespace)

def delete_pc_namespaces(project_id: str, db_name: str):
    namespace = generate_pc_namespace(project_id, db_name)

    index_stats_1536 = pc_index_1536.describe_index_stats()
    namespace_exists_1536 = namespace in index_stats_1536.get("namespaces", {})

    index_stats_3072 = pc_index_3072.describe_index_stats()
    namespace_exists_3072 = namespace in index_stats_3072.get("namespaces", {})
    
    if namespace_exists_1536:
        pc_index_1536.delete(delete_all=True, namespace=namespace)
    if namespace_exists_3072:
        pc_index_3072.delete(delete_all=True, namespace=namespace)

    return True

def delete_pc_vectors_by_id_prefix(project_id: str, db_name: str, prefix: str):
    namespace = generate_pc_namespace(project_id, db_name)
    ids_to_delete_1536 = []
    ids_to_delete_3072 = []
    for ids in pc_index_1536.list(prefix=prefix, namespace=namespace):
        ids_to_delete_1536.extend(ids)
    for ids in pc_index_3072.list(prefix=prefix, namespace=namespace):
        ids_to_delete_3072.extend(ids)

    if ids_to_delete_1536:
        pc_index_1536.delete(ids=ids_to_delete_1536, namespace=namespace)
    if ids_to_delete_3072:
        pc_index_3072.delete(ids=ids_to_delete_3072, namespace=namespace)


def generate_pc_metadata(
    project_id: str,
    db_name: str,
    collection_name: str,
    doc_id: str,
    path: str,
    type: str = "text",
    emb_model: str = "text-embedding-3-small",
):
    metadata = {
        "project_id": project_id,
        "db_name": db_name,
        "collection_name": collection_name,
        "doc_id": doc_id,
        "path": path,
        "type": type,
        "emb_model": emb_model,
    }

    return metadata


def generate_pc_id_prefix(
    project_id: str,
    db_name: str,
    collections_name: str,
    doc_id: str = None,
    path: str = None,
) -> str:
    if doc_id:
        if path:
            pc_id_prefix = (
                project_id
                + "#"
                + db_name
                + "#"
                + collections_name
                + "#"
                + doc_id
                + "#"
                + path
            )
        else:
            pc_id_prefix = (
                project_id + "#" + db_name + "#" + collections_name + "#" + doc_id + "#"
            )

    else:
        pc_id_prefix = project_id + "#" + db_name + "#" + collections_name + "#"

    return pc_id_prefix


def pc_client_query(
    vector: list[float],
    project_id: str,
    db_name: str,
    collection_name: str,
    top_k: int,
    include_embedding: bool,
    model: str,
    doc_ids: list[str] = None,
):

    filter_criteria = {
        "collection_name": {"$eq": collection_name},
        "emb_model": {"$eq": model},
    }
    if doc_ids is not None:
        filter_criteria.update({"doc_id": {"$in": doc_ids}})

    namespace = generate_pc_namespace(project_id, db_name)

    if model == "text-embedding-3-small":
        result = pc_index_1536.query(
            vector=vector,
            namespace=namespace,
            filter=filter_criteria,
            top_k=top_k,
            include_values=include_embedding,
            include_metadata=True,
        )

        return result
    elif model == "text-embedding-3-large":
        result = pc_index_3072.query(
            vector=vector,
            namespace=namespace,
            filter=filter_criteria,
            top_k=top_k,
            include_values=include_embedding,
            include_metadata=True,
        )

        return result


def generate_pc_id(
    project_id: str,
    db_name: str,
    collection_name: str,
    document_id: str,
    path: str,
    chunk_n: int,
) -> list[str]:
    return (
        project_id
        + "#"
        + db_name
        + "#"
        + collection_name
        + "#"
        + document_id
        + "#"
        + path
        + "#"
        + str(chunk_n)
    )


def generate_pc_namespace(project_id: str, db_name: str):
    namespace = project_id + "_" + db_name
    return namespace


def fetch_pinecone_usage(project_id_str: str, db_name: str) -> float:
    namespace = generate_pc_namespace(project_id_str, db_name)
    try:
        index_stats_1536 = pc_index_1536.describe_index_stats()
        namespace_stats_1536 = (
            index_stats_1536.get("namespaces", {})
            .get(namespace, {})
            .get("vector_count", 0)
        )

        index_stats_3072 = pc_index_3072.describe_index_stats()
        namespace_stats_3072 = (
            index_stats_3072.get("namespaces", {})
            .get(namespace, {})
            .get("vector_count", 0)
        )
        # Estimate storage based on vector count (assuming ~6KB per vector)
        storage_mb = (
            (namespace_stats_1536 + namespace_stats_3072) * 6
        ) / 1024  # Convert KB to MB
        return round(storage_mb, 2)
    except Exception as e:
        logger.error(
            f"Failed to fetch Pinecone stats for namespace {namespace}: {e}",
        )
        return 0.0