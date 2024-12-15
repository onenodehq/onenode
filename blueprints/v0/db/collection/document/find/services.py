from blueprints.v0.utils.mongo_operations import get_client_collection


def find_docs_service(
    project_id,
    db_name,
    collection_name,
    filter,
    projection,
    sort,
    skip,
    limit,
):
    mongo_collection = get_client_collection(project_id, db_name, collection_name)
    docs = list(
        mongo_collection.find(
            filter=filter, projection=projection, sort=sort, skip=skip, limit=limit
        )
    )

    return docs
