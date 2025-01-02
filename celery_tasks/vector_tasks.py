from celery_setup import celery
from blueprints.v0.utils.openai_operations import embed_text
from blueprints.v0.utils.pinecone_operations import pc_upsert
from celery_tasks.usage_tasks import increment_collection_usage_cache
from bson import BSON
from utils.email import notify_admin


@celery.task
def save_vectors_task(
    vector_bases: list,
    project_id_str: str,
    db_name: str,
    collection_name: str,
    documents: list[dict],
):
    vectors = []
    total_vector_dimensions = 0
    for vector_basis in vector_bases:
        try:
            embedding = embed_text(
                vector_basis["values"], vector_basis["metadata"]["emb_model"]
            )
            total_vector_dimensions += len(embedding)
            vector_basis.update({"values": embedding})
            vectors.append(vector_basis)
        except Exception as e:
            notify_admin(
                "Embedding Failed",
                f"Failed to embed text for project {project_id_str}: {e}",
            )
            continue
    pc_upsert(vectors, project_id_str, db_name)

    increment_collection_usage_cache(
        project_id_str=project_id_str,
        db_name=db_name,
        collection_name=collection_name,
        inserted_documents=documents,
        total_vector_dimensions=total_vector_dimensions,
    )


@celery.task
def update_vectors_task(vector_bases: list, project_id_str: str, db_name):
    vectors = []
    for vector_basis in vector_bases:
        try:
            embedding = embed_text(vector_basis["values"])
            vector_basis.update({"values": embedding})
            vectors.append(vector_basis)
        except Exception as e:
            notify_admin(
                "Embedding Failed",
                f"Failed to update embedding for project {project_id_str}: {e}",
            )
            continue
    pc_upsert(vectors, project_id_str, db_name)
