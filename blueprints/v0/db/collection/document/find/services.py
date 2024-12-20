from blueprints.v0.utils.mongo_operations import get_client_collection


def find_docs_service(
    project_id,
    db_name,
    collection_name,
    filter=None,
    projection=None,
    sort=None,
    skip=None,
    limit=None,
):
    mongo_collection = get_client_collection(project_id, db_name, collection_name)

    # Initialize with all parameters
    query_params = {"filter": filter, "projection": projection, "sort": sort}

    # Only add skip and limit if they're not None since they don't accept None
    if skip is not None:
        query_params["skip"] = skip
    if limit is not None:
        query_params["limit"] = limit

    # Execute find operation
    docs = list(mongo_collection.find(**query_params))
    return docs
