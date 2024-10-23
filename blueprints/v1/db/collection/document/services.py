from bson import ObjectId
from flask import g
from blueprints.v1.db.collection.document.helper import (
    delete_pc_vectors,
    prepare_update_fields,
    process_document_fields,
)
from blueprints.v1.utils.free_tier_monitorings import (
    check_mongo_storage,
    check_pc_storage,
)
from blueprints.v1.utils.mongo_operations import (
    get_client_collection,
    get_doc_ids_by_filter,
)
from blueprints.v1.utils.pinecone_operations import pc_delete_with_doc_ids
from blueprints.v1.utils.pinecone_setup import pc
from celery_tasks import save_vectors_task


def create_docs_service(
    documents: list[dict], project_id: str, db_name: str, collection_name: str
):
    
    if g.plan == "free":
        check_mongo_storage(project_id, db_name)
        check_pc_storage(project_id, db_name)

    mongo_collection = get_client_collection(project_id, db_name, collection_name)

    all_vector_bases = []
    for document in documents:
        if not document.get("_id"):
            document["_id"] = ObjectId()
        doc_id = str(document["_id"])
        vector_bases = process_document_fields(
            document,
            project_id,
            db_name,
            collection_name,
            doc_id,
        )
        all_vector_bases.extend(vector_bases)
    # documents, all_chunks, and all_pc_ids will be modified after process_doc()
    mongo_collection.insert_many(documents=documents)

    if all_vector_bases:
        task = save_vectors_task.delay(all_vector_bases, project_id, db_name)
        return task.id

    return


def update_docs_service(
    filter: dict, update: dict, project_id: str, db_name: str, collection_name: str
):
    if g.plan == "free":
        check_mongo_storage(project_id, db_name)
        check_pc_storage(project_id, db_name)
    mongo_collection = get_client_collection(project_id, db_name, collection_name)

    documents_to_update = mongo_collection.find(filter=filter, projection={"_id": 1})
    doc_ids: list[str] = [str(document["_id"]) for document in documents_to_update]
    if not doc_ids:
        return

    non_emb_paths: list[str] = []
    all_vector_bases = []
    for operator, fields in update.items():
        vector_bases = prepare_update_fields(
            operator,
            fields,
            project_id,
            db_name,
            collection_name,
            doc_ids,
            non_emb_paths,
        )
        if vector_bases:
            all_vector_bases.extend(vector_bases)

    mongo_collection.update_many(filter=filter, update=update)

    delete_pc_vectors(
        doc_ids,
        non_emb_paths,
        project_id,
        db_name,
        collection_name,
    )

    if all_vector_bases:
        task = save_vectors_task.delay(all_vector_bases, project_id, db_name)
        return task.id

    return


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
    collection.delete_many(filter=filter)

    pc_delete_with_doc_ids(
        project_id,
        db_name,
        collection_name,
        doc_ids,
    )
    return
