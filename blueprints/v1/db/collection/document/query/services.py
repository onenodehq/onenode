from bson import ObjectId
from pymongo import ASCENDING
from blueprints.v1.db.collection.document.query.helper import compose_query_response
from blueprints.v1.utils.mongo_operations import (
    get_client_collection,
    get_doc_ids_by_filter,
)
from blueprints.v1.utils.openai_operations import embed_text
from blueprints.v1.utils.pinecone_operations import (
    get_pc_ids_by_doc_ids,
    pc_client_query,
)


def query_chunks_service(
    text: str,
    project_id: str,
    db_name: str,
    collection_name: str,
    filter: dict = None,
    top_k: int | None = 10,
    include_values: bool = False,
) -> list[dict]:
    mongo_collection = get_client_collection(project_id, db_name, collection_name)
    vector: list[float] = embed_text(text)

    if filter:
        doc_ids_to_filter = get_doc_ids_by_filter(
            filter, project_id, db_name, collection_name
        )

        # Collection + document filter
        query_res = pc_client_query(
            vector,
            project_id,
            db_name,
            collection_name,
            top_k,
            include_values,
            doc_ids_to_filter,
        )
    else:
        # Collection filter
        query_res = pc_client_query(
            vector,
            project_id,
            db_name,
            collection_name,
            top_k,
            include_values,
        )

    matches = query_res["matches"]

    unique_doc_ids: list[ObjectId] = list(
        {
            ObjectId(item["metadata"]["doc_id"])
            for item in matches
            if "metadata" in item and "doc_id" in item["metadata"]
        }
    )

    matched_docs = list(mongo_collection.find({"_id": {"$in": unique_doc_ids}}))
    doc_lookup = {str(doc["_id"]): doc for doc in matched_docs}

    data = compose_query_response(
        matches,
        doc_lookup,
        include_values,
    )

    return data
