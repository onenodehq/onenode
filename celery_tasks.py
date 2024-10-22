from blueprints.v1.utils.openai_operations import embed_text
from blueprints.v1.utils.pinecone_operations import pc_upsert
from celery_setup import celery


@celery.task(bind=True)
def save_vectors_task(self, vector_bases: list, project_id: str, db_name):
    vectors = []
    for vector_basis in vector_bases:
        embedding = embed_text(vector_basis["values"])
        vector_basis.update({"values": embedding})
        vectors.append(vector_basis)
    pc_upsert(vectors, project_id, db_name)

    return
