from bson import ObjectId
from flask import abort
from blueprints.v1.org.project.collection.document.helper import (
    create_vectors,
    prepare_update_fields,
    process_document_fields,
    update_pc,
)
from blueprints.v1.utils.openai_operations import embed_texts
from blueprints.v1.utils.pinecone_operations import pc_client_upsert
from celery_setup import celery
from blueprints.v1.utils.mongo_setup import mongo_client_db


@celery.task
def example_task():
    # Process your task here
    collection = mongo_client_db.get_collection("index")
    collection.insert_one(document={"key1": "Celery test 02"})
    return


@celery.task(bind=True)
def create_documents_task(self, documents: list[dict], namespace: str):
    try:
        mongo_collection = mongo_client_db.get_collection(name=namespace)
        self.update_state(state="PROGRESS")

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

        self.update_state(state="SUCCESS")
        return
    except Exception as e:
        print("error", e)
        self.update_state(state="FAIL")
        raise


@celery.task(bind=True)
def update_documents_task(
    self, document_ids: list[str], filter: dict, update: dict, namespace: str
):
    self.update_state(state="PROGRESS")
    mongo_collection = mongo_client_db.get_collection(name=namespace)

    all_chunks: list[str] = []
    all_pc_id_suffixes: list[dict] = []
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
            all_pc_id_suffixes=all_pc_id_suffixes,
            non_emb_paths=non_emb_paths,
        )

    mongo_collection.update_many(filter=filter, update=update)

    update_pc(
        document_ids=document_ids,
        all_chunks=all_chunks,
        all_pc_id_suffixes=all_pc_id_suffixes,
        non_emb_paths=non_emb_paths,
        namespace=namespace,
    )
    self.update_state(state="SUCCESS")

    return
