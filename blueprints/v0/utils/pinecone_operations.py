import os
from blueprints.v0.utils.pinecone_setup import (
    DIMENSIONS,
    pc_admin_index,
    pc_client_index,
)
from pinecone.core.client.models import UpsertResponse, QueryResponse


dummy_vector = [0] * DIMENSIONS


def query_resources_by_id(resource_id: str, user_id: str):
    filter = {"id": {"$eq": resource_id}, "user_id": {"$eq": user_id}}
    data = pc_admin_index.query(
        vector=dummy_vector, filter=filter, include_metadata=True, top_k=1
    )
    return data


def query_resources_by_user_id(user_id: str):
    filter = {"user_id": {"$eq": user_id}}
    data = pc_admin_index.query(
        vector=dummy_vector, filter=filter, include_metadata=True, top_k=10000
    )
    return data


def pc_delete_with_doc_ids(
    project_id: str, db_name: str, collection_name: str, doc_ids: list[str]
):
    namespace = generate_pc_namespace(project_id, db_name)
    ids_to_delete = []
    for doc_id in doc_ids:
        prefix = generate_pc_id_prefix(project_id, db_name, collection_name, doc_id)
        for ids in pc_client_index.list(prefix=prefix, namespace=namespace):
            ids_to_delete.extend(ids)
        # If there are any IDs to delete, perform the deletion
    if ids_to_delete:
        pc_client_index.delete(ids=ids_to_delete, namespace=namespace)


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


def pc_upsert(vectors: list, project_id: str, db_name) -> UpsertResponse:
    namespace = generate_pc_namespace(project_id, db_name)
    result = pc_client_index.upsert(vectors=vectors, namespace=namespace)
    return result


def pc_client_delete_collection(project_id: str, db_name: str, collection_name: str):
    collection_prefix = generate_pc_id_prefix(project_id, db_name, collection_name)
    ids_to_delete = []
    for ids in pc_client_index.list(prefix=collection_prefix):
        ids_to_delete.extend(ids)

    if ids_to_delete:
        pc_client_index.delete(ids=ids_to_delete)


def generate_pc_metadata(
    project_id: str,
    db_name: str,
    collection_name: str,
    doc_id: str,
    path: str,
    type: str = "text",
):
    metadata = {
        "project_id": project_id,
        "db_name": db_name,
        "collection_name": collection_name,
        "doc_id": doc_id,
        "path": path,
        "type": type,
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
    include_values: bool,
    doc_ids: list[str] = None,
) -> QueryResponse:

    filter_criteria = {
        "collection_name": {"$eq": collection_name},
    }
    if doc_ids:
        filter_criteria.update({"doc_id": {"$in": doc_ids}})

    namespace = generate_pc_namespace(project_id, db_name)
    result = pc_client_index.query(
        vector=vector,
        namespace=namespace,
        filter=filter_criteria,
        top_k=top_k,
        include_values=include_values,
        include_metadata=True,
    )

    return result


def get_pc_ids_by_doc_ids(
    project_id: str, db_name: str, collection_name: str, doc_ids: list[str]
):
    pc_ids = []
    for doc_id in doc_ids:
        prefix = generate_pc_id_prefix(project_id, db_name, collection_name, doc_id)
        for ids in pc_client_index.list(prefix=prefix):
            pc_ids.extend(ids)

    return pc_ids


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
