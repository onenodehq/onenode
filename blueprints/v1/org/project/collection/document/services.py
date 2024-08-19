from bson import ObjectId
from flask import abort
from blueprints.v1.org.project.collection.document.helper import (
    create_vectors,
    prepare_update_fields,
    process_document_fields,
    update_pc,
)
from blueprints.v1.utils.openai_operations import embed_texts
from blueprints.v1.utils.pinecone_operations import (
    pc_client_delete_with_prefixes,
    pc_client_upsert,
)
from blueprints.v1.utils.pinecone_setup import pc_client_index
from blueprints.v1.utils.mongo_setup import mongo_client_db


def create_documents_service(documents: list[dict], namespace: str) -> list[dict]:
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection '{namespace}' not found")

    all_chunks: list[str] = []
    all_pc_ids: list[str] = []

    for document in documents:
        if not document.get("_id"):
            document["_id"] = ObjectId()
        document_id = str(document["_id"])
        process_document_fields(
            data=document,
            document_id=document_id,
            all_chunks=all_chunks,
            all_pc_ids=all_pc_ids,
        )
    # documents, all_chunks, and all_pc_ids will be modified after process_doc()
    mongo_collection.insert_many(documents=documents)

    if all_chunks:
        embeddings = embed_texts(texts=all_chunks)
        vectors = create_vectors(embeddings=embeddings, pc_ids=all_pc_ids)
        pc_client_upsert(vectors=vectors, namespace=namespace)

    result = documents

    return result


def update_documents_service(filter: dict, update: dict, namespace: str):
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection not found")

    documents_to_update = mongo_collection.find(filter=filter, projection={"_id": 1})
    document_ids: list[str] = [str(document["_id"]) for document in documents_to_update]
    if not document_ids:
        return

    all_chunks: list[str] = []
    emb_paths: list[dict] = []
    non_emb_paths: list[str] = []
    for operator, fields in update.items():
        if not isinstance(fields, dict):  # Check if fields is not a dictionary
            abort(
                400,
                description=f"Expected dictionary for {operator}, but got {type(fields).__name__} instead.",
            )
        prepare_update_fields(
            operator=operator,
            fields=fields,
            all_chunks=all_chunks,
            emb_paths=emb_paths,
            non_emb_paths=non_emb_paths,
        )

    mongo_collection.update_many(filter=filter, update=update)

    update_pc(
        document_ids=document_ids,
        all_chunks=all_chunks,
        emb_paths=emb_paths,
        non_emb_paths=non_emb_paths,
        namespace=namespace,
    )

    return


def delete_documents_service(filter: dict, namespace: str):
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection not found")

    documents_to_delete = mongo_collection.find(filter=filter, projection={"_id": 1})
    document_ids: list[str] = [str(document["_id"]) for document in documents_to_delete]

    if not document_ids:
        return

    mongo_collection.delete_many(filter=filter)
    pc_client_delete_with_prefixes(prefixes=document_ids)
    return
