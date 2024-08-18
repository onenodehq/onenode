import os
from blueprints.v1.utils.pinecone_setup import (
    DIMENSIONS,
    pc_admin_index,
    pc_client_index,
)


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


def query_all_resources(user_id: str):
    if user_id == os.getenv("ADMIN_ID"):
        data = pc_admin_index.query(
            vector=dummy_vector, include_metadata=True, top_k=10000
        )
        return data
    else:
        raise PermissionError("Failed to authorize admin request")


# Returns:
# {
#     "matches": [
#         {
#             "id": "C",
#             "score": -1.76717265e-07,
#             "values": [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
#         },
#         {
#             "id": "B",
#             "score": 0.080000028,
#             "values": [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
#         },
#         {
#             "id": "D",
#             "score": 0.0800001323,
#             "values": [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
#         },
#     ],
#     "namespace": "example-namespace",
#     "usage": {"readUnits": 5}
# }


def pc_client_delete_with_prefixes(prefixes: list[str], namespace: str):
    """
    Delete items from a Pinecone index based on a list of ID prefixes.

    :param index: Pinecone index object.
    :param prefixes: List of ID prefixes to match for deletion.
    :param namespace: The namespace in which the items exist.
    """
    for prefix in prefixes:
        # List all IDs with the given prefix
        ids_to_delete = pc_client_index.list(prefix=prefix, namespace=namespace)

        # If there are any IDs to delete, perform the deletion
        if ids_to_delete:
            pc_client_index.delete(ids=ids_to_delete, namespace=namespace)
