import os
from typeguard import typechecked
from blueprints.v1.utils.pinecone_setup import DIMENSIONS, index


dummy_vector = [0] * DIMENSIONS

@typechecked
def query_resources_by_id(resource_id: str, user_id:str):
    filter = {"id": {"$eq": resource_id}, "user_id": {"$eq": user_id}}
    data = index.query(vector=dummy_vector, filter=filter, include_metadata=True, top_k=1)
    return data

@typechecked
def query_resources_by_user_id(user_id:str):
    filter = {"user_id": {"$eq": user_id}}
    data = index.query(vector=dummy_vector, filter=filter, include_metadata=True, top_k=10000)
    return data

@typechecked
def query_all_resources(user_id:str):
    if user_id == os.getenv("ADMIN_ID"):
        data = index.query(
            vector=dummy_vector, include_metadata=True, top_k=10000
        )
        return data
    else:
        raise PermissionError("Failed to authorize admin request")