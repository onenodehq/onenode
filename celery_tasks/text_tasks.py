from celery_setup import celery
from blueprints.v0.utils.openai_operations import embed_text
from blueprints.v0.utils.pinecone_operations import batch_iterable, pc_upsert
from logger import logger


@celery.task
def save_text_tasks(
    text_tasks: list,
    project_id_str: str,
    db_name: str,
    collection_name: str,
    documents: list[dict],
):
    batch_size = 100  # Process every 100 vectors

    for batch in batch_iterable(text_tasks, batch_size):
        vectors_1536 = []
        vectors_3072 = []
        total_vector_dimensions = 0
        for vector_basis in batch:
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
                    logger.error(
                        f"Unsupported Vector Dimension: {embedding_length} for project {project_id_str}"
                    )

            except Exception as e:
                logger.error(
                    f"Embedding Failed: {e} for project {project_id_str}",
                )

        if vectors_1536:
            try:
                pc_upsert(
                    vectors=vectors_1536,
                    project_id=project_id_str,
                    db_name=db_name,
                    dimensions=1536,
                )
            except Exception as e:
                logger.error(
                    "Pinecone Upsert Failed",
                    f"Failed to upsert 1536-dimension vectors for project {project_id_str}: {e}",
                )
                continue

        if vectors_3072:
            try:
                pc_upsert(
                    vectors=vectors_3072,
                    project_id=project_id_str,
                    db_name=db_name,
                    dimensions=3072,
                )
            except Exception as e:
                logger.error(
                    "Pinecone Upsert Failed",
                    f"Failed to upsert 3072-dimension vectors for project {project_id_str}: {e}",
                )
                continue




@celery.task
def update_vectors_task(
    text_tasks: list, project_id_str: str, db_name: str, collection_name: str
):
    batch_size = 100  # Process every 100 vectors

    for batch in batch_iterable(text_tasks, batch_size):
        vectors_1536 = []
        vectors_3072 = []
        for vector_basis in batch:
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
                    continue

            except Exception as e:
                logger.error(
                    f"Embedding Failed: {e} for project {project_id_str}",
                )
                continue

        if vectors_1536:
            try:
                pc_upsert(
                    vectors=vectors_1536,
                    project_id=project_id_str,
                    db_name=db_name,
                    dimensions=1536,
                )
            except Exception as e:
                logger.error(
                    f"Pinecone Upsert Failed: {e} for project {project_id_str}",
                )
                continue

        if vectors_3072:
            try:
                pc_upsert(
                    vectors=batch,
                    project_id=project_id_str,
                    db_name=db_name,
                    dimensions=3072,
                )
            except Exception as e:
                logger.error(
                    f"Pinecone Upsert Failed: {e} for project {project_id_str}",
                )
                continue
