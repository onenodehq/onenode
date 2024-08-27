from bson import ObjectId
from blueprints.v1.org.project.collection.document.helper import (
    create_vectors,
    process_document_fields,
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
