from celery_setup import celery
from blueprints.v0.utils.openai_operations import embed_text
from blueprints.v0.utils.pinecone_operations import pc_upsert
from celery_tasks.usage_tasks import increment_collection_usage_cache
from utils.email import notify_admin
from itertools import islice


# helper
def batch_iterable(iterable, batch_size):
    it = iter(iterable)
    while True:
        batch = list(islice(it, batch_size))
        if not batch:
            break
        yield batch


@celery.task
def save_vectors_task(
    vector_bases: list,
    project_id_str: str,
    db_name: str,
    collection_name: str,
    documents: list[dict],
):
    vectors_1536 = []
    vectors_3072 = []
    total_vector_dimensions = 0

    for vector_basis in vector_bases:
        try:
            embedding = embed_text(
                vector_basis["values"], vector_basis["metadata"]["emb_model"]
            )
            embedding_length = len(embedding)
            total_vector_dimensions += embedding_length
            vector_basis.update({"values": embedding})

            if embedding_length == 1536:
                vectors_1536.append(vector_basis)
            elif embedding_length == 3072:
                vectors_3072.append(vector_basis)
            else:
                notify_admin(
                    "Unsupported Vector Dimension",
                    f"Vector with unsupported dimension {embedding_length} encountered for project {project_id_str}.",
                )
                continue

        except Exception as e:
            notify_admin(
                "Embedding Failed",
                f"Failed to embed text for project {project_id_str}: {e}",
            )
            continue

    # Define batch size (adjust as needed)
    batch_size = 100

    for batch in batch_iterable(vectors_1536, batch_size):
        try:
            pc_upsert(
                vectors=batch,
                project_id=project_id_str,
                db_name=db_name,
                dimensions=1536,
            )
        except Exception as e:
            notify_admin(
                "Pinecone Upsert Failed",
                f"Failed to upsert 1536-dimension vectors for project {project_id_str}: {e}",
            )
            continue

    # Upsert vectors with dimension 3072
    for batch in batch_iterable(vectors_3072, batch_size):
        try:
            pc_upsert(
                vectors=batch,
                project_id=project_id_str,
                db_name=db_name,
                dimensions=3072,
            )
        except Exception as e:
            notify_admin(
                "Pinecone Upsert Failed",
                f"Failed to upsert 3072-dimension vectors for project {project_id_str}: {e}",
            )
            continue

    try:
        increment_collection_usage_cache(
            project_id_str=project_id_str,
            db_name=db_name,
            collection_name=collection_name,
            inserted_documents=documents,
            total_vector_dimensions=total_vector_dimensions,
        )
    except Exception as e:
        notify_admin(
            "Usage Cache Update Failed",
            f"Failed to update usage cache for project {project_id_str}: {e}",
        )


@celery.task
def update_vectors_task(
    vector_bases: list, project_id_str: str, db_name: str, collection_name: str
):
    vectors_1536 = []
    vectors_3072 = []

    for vector_basis in vector_bases:
        try:
            embedding = embed_text(
                vector_basis["values"], vector_basis["metadata"]["emb_model"]
            )
            embedding_length = len(embedding)
            vector_basis.update({"values": embedding})

            if embedding_length == 1536:
                vectors_1536.append(vector_basis)
            elif embedding_length == 3072:
                vectors_3072.append(vector_basis)
            else:
                notify_admin(
                    "Unsupported Vector Dimension",
                    f"Vector with unsupported dimension {embedding_length} encountered for project {project_id_str}.",
                )
                continue

        except Exception as e:
            notify_admin(
                "Embedding Failed",
                f"Failed to update embedding for project {project_id_str}: {e}",
            )
            continue
    batch_size = 100

    for batch in batch_iterable(vectors_1536, batch_size):
        try:
            pc_upsert(
                vectors=batch,
                project_id=project_id_str,
                db_name=db_name,
                dimensions=1536,
            )
        except Exception as e:
            notify_admin(
                "Pinecone Upsert Failed",
                f"Failed to upsert 1536-dimension vectors for project {project_id_str}: {e}",
            )
            continue

    for batch in batch_iterable(vectors_3072, batch_size):
        try:
            pc_upsert(
                vectors=batch,
                project_id=project_id_str,
                db_name=db_name,
                dimensions=3072,
            )
        except Exception as e:
            notify_admin(
                "Pinecone Upsert Failed",
                f"Failed to upsert 3072-dimension vectors for project {project_id_str}: {e}",
            )
            continue
