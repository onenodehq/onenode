from typing import Dict, List, Any
from pymongo.collection import Collection
from blueprints.v1.utils.mongo_operations import get_client_collection


def find_docs_service(
    project_id: str,
    db_name: str,
    collection_name: str,
    filter: dict | None,
    projection: dict | None,
    sort: list[tuple] | None,
    skip: int | None,
    limit: int | None,
) -> List[Dict[str, Any]]:
    mongo_collection: Collection = get_client_collection(project_id, db_name, collection_name)

    # Build query parameters dictionary with only non-None values
    query_params = {k: v for k, v in {
        "filter": filter or {},
        "projection": projection,
        "sort": sort,
        "skip": skip,
        "limit": limit
    }.items() if v is not None}

    # Execute find operation
    docs = list(mongo_collection.find(**query_params))
    return docs
