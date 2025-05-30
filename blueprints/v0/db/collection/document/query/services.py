from bson import ObjectId
from blueprints.v0.db.collection.document.query.helper import (
    compose_query_response,
    convert_projection,
)
from blueprints.v0.utils.mongo_operations import (
    get_client_collection,
    get_doc_ids_by_filter,
)
from blueprints.v0.utils.openai_operations import embed_text
from blueprints.v0.utils.pinecone_operations import (
    pc_client_query,
)


def query_chunks_service(
    project_id: str,
    db_name: str,
    collection_name: str,
    text: str,
    filter: dict,
    top_k: int,
    projection: dict | None,
    include_values: bool,
    emb_model: str,
) -> list[dict]:
    mongo_collection = get_client_collection(project_id, db_name, collection_name)
    vector: list[float] = embed_text(text, emb_model)

    mongo_projection = convert_projection(projection)

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
            emb_model,
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
            emb_model,
        )

    matches = query_res["matches"]

    unique_doc_ids: list[ObjectId] = list(
        {
            ObjectId(item["metadata"]["doc_id"])
            for item in matches
            if "metadata" in item and "doc_id" in item["metadata"]
        }
    )

    matched_docs = list(
        mongo_collection.find({"_id": {"$in": unique_doc_ids}}, mongo_projection)
    )
    doc_lookup = {str(doc["_id"]): doc for doc in matched_docs}

    data = compose_query_response(
        matches,
        doc_lookup,
        include_values,
    )

    return data
