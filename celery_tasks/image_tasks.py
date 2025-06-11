from celery_setup import celery
from blueprints.v0.utils.s3_operations import retrieve_from_s3, generate_public_url
from blueprints.v0.utils.openai_operations import (
    image_to_text,
)
from blueprints.v0.project.db.collection.document.helper import chunk
from blueprints.v0.utils.pinecone_operations import (
    create_vector_bases,
    generate_pc_metadata,
)
from blueprints.v0.utils.mongo_operations import (
    get_client_collection,
)
from bson import ObjectId
from utils.email import notify_admin

from celery_tasks.text_tasks import save_text_tasks
from logger import logger


@celery.task
def embed_image_task(refs: list[dict]):
    for ref in refs:
        object_key = ref["object_key"]
        emb_model = ref["emb_model"]
        vision_model = ref["vision_model"]
        max_chunk_size = ref["max_chunk_size"]
        chunk_overlap = ref["chunk_overlap"]
        is_separator_regex = ref["is_separator_regex"]
        separators = ref["separators"]
        keep_separator = ref["keep_separator"]
        index = ref["index"]
        project_id, db_name, collection_name, doc_id, path, _ = object_key.split("/")

        mongo_collection = get_client_collection(project_id, db_name, collection_name)

        try:
            # Retrieve image from S3
            binary_data, mime_type = retrieve_from_s3(object_key)
            
            # Generate public URL for the image
            public_url = generate_public_url(object_key)

            if index:
                # Call dummy OpenAI vision function to generate description
                description = image_to_text(binary_data, mime_type, vision_model)

                # Chunk the generated description
                chunks = chunk(
                    description,
                    max_chunk_size=max_chunk_size,
                    chunk_overlap=chunk_overlap,
                    is_separator_regex=is_separator_regex,
                    separators=separators,
                    keep_separator=keep_separator,
                )

                # Embed each chunk
                metadata = generate_pc_metadata(
                    project_id,
                    db_name,
                    collection_name,
                    doc_id,
                    path,
                    type="image",
                    emb_model=emb_model,
                )
                vector_bases = create_vector_bases(
                    chunks,
                    metadata,
                    project_id,
                    db_name,
                    collection_name,
                    doc_id,
                    path,
                )

                # Save the embedding to Pinecone
                save_text_tasks(vector_bases, project_id, db_name, collection_name, [])

            # Prepare the update fields
            update_fields = {
                f"{path}.xImage.status": "processed",
                f"{path}.xImage.data": public_url,
                f"{path}.xImage.index": index,
            }
            
            # Only add chunks if index is enabled
            if index:
                update_fields[f"{path}.xImage.chunks"] = chunks

            mongo_collection.update_one(
                {"_id": ObjectId(doc_id)},
                {"$set": update_fields},
            )
        except Exception as e:
            mongo_collection.update_one(
                {"_id": ObjectId(doc_id)},
                {
                    "$set": {
                        f"{path}.xImage.status": "failed",
                        f"{path}.xImage.data": public_url,
                    }
                },
            )
            error_message = f"EmbImage processing failed for document {doc_id} in {project_id}/{db_name}/{collection_name}, path: {path}. Error: {str(e)}"
            logger.error(f"Exception: {e}", exc_info=True)
            
            # Send email notification to admin
            notify_admin(
                subject="EmbImage Processing Failure",
                body=error_message
            )
            
            continue
