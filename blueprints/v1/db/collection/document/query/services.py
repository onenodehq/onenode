from bson import ObjectId
from pymongo import ASCENDING
from blueprints.v1.db.collection.document.query.helper import (
    compose_query_data,
)
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
        document_ids_to_filter = get_doc_ids_by_filter(
            mongo_collection=mongo_collection, filter=filter
        )

        pc_ids = get_pc_ids_by_doc_ids(
            project_id, db_name, collection_name, document_ids_to_filter
        )

        pc_filter = {"_id": {"$in": pc_ids}}

        query_res = pc_client_query(
            vector=vector,
            project_id=project_id,
            collection_name=collection_name,
            filter=pc_filter,
            top_k=top_k,
            include_values=include_values,
        )
    else:
        query_res = pc_client_query(
            vector=vector,
            project_id=project_id,
            collection_name=collection_name,
            top_k=top_k,
            include_values=include_values,
        )

    matches = query_res["matches"]
    sorted_matches = sorted(
        matches,
        key=lambda x: ObjectId(
            x.get("metadata", {}).get("_id", "000000000000000000000000")
        ),
    )

    unique_doc_ids: list[ObjectId] = list(
        {
            ObjectId(item.get("metadata", {}).get("_id"))
            for item in sorted_matches
            if "_id" in item.get("metadata", {})
        }
    )

    sorted_documents = list(
        mongo_collection.find({"_id": {"$in": unique_doc_ids}}).sort("_id", ASCENDING)
    )

    data = compose_query_data(
        matches=matches,
        sorted_documents=sorted_documents,
        include_values=include_values,
    )

    return data
