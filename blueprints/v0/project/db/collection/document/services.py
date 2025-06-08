from bson import ObjectId
from flask import g
from blueprints.v0.project.db.collection.document.helper import (
    delete_overwritten_pc_vectors,
    delete_overwritten_s3_images,
    process_document,
    process_update,
)
from blueprints.v0.utils.free_tier_monitorings import (
    check_mongo_storage,
    check_pc_storage,
)
from blueprints.v0.utils.mongo_operations import (
    get_client_collection,
    get_doc_ids_by_filter,
)
from blueprints.v0.utils.pinecone_operations import pc_delete_with_doc_ids
from blueprints.v0.utils.s3_operations import delete_s3_objects_with_doc_ids, save_to_s3
from celery_tasks import (
    save_text_tasks,
    decrement_collection_usage_cache,
    update_vectors_task,
)
from celery_tasks.image_tasks import embed_image_task
from utils.usage import check_current_usage


def create_docs_service(
    documents: list[dict], 
    project_id: str, 
    db_name: str, 
    collection_name: str,
    request_files: dict = None,
):

    if g.plan == "free":
        check_current_usage(project_id)

    mongo_collection = get_client_collection(
        project_id, db_name, collection_name, must_exist=False
    )

    all_text_tasks = []
    all_image_tasks = []
    for doc_index, document in enumerate(documents):
        if not document.get("_id"):
            document["_id"] = ObjectId()
        doc_id = str(document["_id"])
        result = process_document(
            document,
            project_id,
            db_name,
            collection_name,
            [doc_id],
            request_files=request_files,
            doc_index=doc_index,
        )
        all_text_tasks.extend(result["text_tasks"])
        all_image_tasks.extend(result["image_tasks"])
    # documents, all_chunks, and all_pc_ids will be modified after process_doc()
    insert_many_result = mongo_collection.insert_many(documents=documents)
    inserted_ids = insert_many_result.inserted_ids

    if all_text_tasks:
        task = save_text_tasks.delay(
            all_text_tasks, project_id, db_name, collection_name, documents
        )

    if all_image_tasks:
        for emb_image_ref in all_image_tasks:
            binary_data = emb_image_ref["binary_data"]
            object_key = emb_image_ref["object_key"]
            mime_type = emb_image_ref["mime_type"]
            save_to_s3(binary_data, object_key, mime_type)

        emb_task = embed_image_task.delay(all_image_tasks)

    return {
        "inserted_ids": inserted_ids,
    }


def update_docs_service(
    filter: dict, 
    update: dict, 
    project_id: str, 
    db_name: str, 
    collection_name: str,
    request_files: dict = None,
):
    if g.plan == "free":
        check_mongo_storage(project_id, db_name)
        check_pc_storage(project_id, db_name)
    mongo_collection = get_client_collection(project_id, db_name, collection_name)

    documents_to_update = mongo_collection.find(filter=filter, projection={"_id": 1})
    doc_ids: list[str] = [str(document["_id"]) for document in documents_to_update]
    if not doc_ids:
        return

    all_text_tasks = []
    all_image_tasks = []
    updated_paths = []
    for operator, fields in update.items():
        result = process_update(
            operator,
            fields,
            project_id,
            db_name,
            collection_name,
            doc_ids,
            updated_paths,
            request_files=request_files,
            doc_index=0,  # For updates, we assume single document context
        )
        all_text_tasks.extend(result["text_tasks"])
        all_image_tasks.extend(result["image_tasks"])

    update_result = mongo_collection.update_many(filter=filter, update=update)

    delete_overwritten_pc_vectors(
        doc_ids,
        updated_paths,
        project_id,
        db_name,
    )

    delete_overwritten_s3_images(
        doc_ids,
        updated_paths,
        project_id,
        db_name,
        collection_name,
    )

    if all_text_tasks:
        task = update_vectors_task.delay(all_text_tasks, project_id, db_name, collection_name)

    if all_image_tasks:
        emb_task = embed_image_task.delay(all_image_tasks)

    return {
        "matched_count": update_result.matched_count,
        "modified_count": update_result.modified_count,
        "upserted_id": update_result.upserted_id,
    }


def delete_docs_service(
    filter: dict, project_id: str, db_name: str, collection_name: str
):

    doc_ids = get_doc_ids_by_filter(
        filter,
        project_id,
        db_name,
        collection_name,
    )

    if not doc_ids:
        return

    collection = get_client_collection(project_id, db_name, collection_name)
    delete_result = collection.delete_many(filter=filter)
    pc_delete_with_doc_ids(
        project_id,
        db_name,
        collection_name,
        doc_ids,
    )

    delete_s3_objects_with_doc_ids(project_id, db_name, collection_name, doc_ids)

    if doc_ids:
        decrement_collection_usage_cache.delay(
            project_id_str=project_id,
            db_name=db_name,
            collection_name=collection_name,
            doc_delta=len(doc_ids),
        )
    return {"deleted_count": delete_result.deleted_count}
