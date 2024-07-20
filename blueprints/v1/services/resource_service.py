import datetime
import uuid
from typing import List
import pymongo
from typeguard import typechecked
from blueprints.v1.utils.cloudfront_operations import generate_cloudfront_signed_url
from blueprints.v1.utils.pinecone_setup import (
    vectorstore,
    pc_index,
    openai_ef,
)
from langchain.schema import Document
from blueprints.v1.utils.resource_helper import (
    convert_keys_to_snake_case,
    is_signed_url_expired,
)
from blueprints.v1.utils.s3_operations import (
    delete_s3_objects,
    process_image_resources,
)
from blueprints.v1.utils.mongo_setup import mongo_collection


def get_resource_service(request, user_id):
    try:
        id = request.args.get("resource_id", "")
        is_admin = request.args.get("is_admin", "") == "True"

        if is_admin:
            data = mongo_collection.find({}, projection={"_id": 0}).sort(
                "created_at", pymongo.DESCENDING
            )
        elif id:
            data = mongo_collection.find(
                {"user_id": user_id, "_id": id}, projection={"_id": 0}
            ).sort("created_at", pymongo.DESCENDING)
        else:
            data = mongo_collection.find(
                {"user_id": user_id}, projection={"_id": 0}
            ).sort("created_at", pymongo.DESCENDING)

        if not data:
            raise ValueError("No data found for the provided IDs")

        data: List = list(data)
        response = []

        for item in data:
            if item.get("type").startswith("image/"):
                signed_url = item.get("signed_url")
                if not signed_url or is_signed_url_expired(signed_url=signed_url):
                    # Generate signed URL if necessary
                    new_signed_url = generate_cloudfront_signed_url(item.get("s3_key"))
                    item.update({"signed_url": new_signed_url})
                    filter = {"_id": item.get("id"), "user_id": user_id}
                    update = {"$set": {"signed_url": new_signed_url}}
                    mongo_collection.update_one(filter=filter, update=update)

            item_dict = {
                "content": item.get("text"),
                "metadata": item,
            }
            response.append(item_dict)
        return response
    except Exception as e:
        # Propagate the exception
        raise e


def create_resource_service(request, user_id):
    try:
        content_type = request.content_type

        if content_type != "application/json":
            raise ValueError("Unsupported content type")

        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")

        resources = data.get("resources")
        if not resources:
            raise ValueError("No resources provided")

        ids = [str(uuid.uuid4()) for _ in resources]
        created_at = datetime.datetime.now().isoformat()

        resources = process_image_resources(
            resources=resources, ids=ids, user_id=user_id
        )
        documents: List[Document] = []
        response: List[dict] = []

        for i, resource in enumerate(resources):
            metadata = resource.get("metadata")
            content = resource.get("content")
            if not metadata:
                raise ValueError(f"Metadata missing for resource {i}")

            metadata_snake_case = convert_keys_to_snake_case(metadata)
            metadata_snake_case.update(
                {
                    "id": ids[i],
                    "created_at": created_at,
                    "updated_at": created_at,
                    "user_id": user_id,
                }
            )

            document = Document(metadata=metadata_snake_case, page_content=content)
            documents.append(document)
            response_metadata = metadata_snake_case.copy()
            if metadata_snake_case.get("s3_key"):
                response_metadata.update(
                    {
                        "signed_url": generate_cloudfront_signed_url(
                            metadata_snake_case["s3_key"]
                        )
                    }
                )
            response_item = {
                "content": content,
                "metadata": response_metadata,
            }

            response.append(response_item)

        vectorstore.add_documents(documents=documents, ids=ids)

        mongo_documents = []
        for i, document in enumerate(documents):
            document_dict = document.to_json()
            metadata = document_dict.get("kwargs", {}).get("metadata", {})
            metadata["_id"] = ids[i]
            mongo_documents.append(metadata)
        mongo_collection.insert_many(documents=mongo_documents)

        return response
    except Exception as e:
        # Propagate the exception
        raise e


def update_resource_service(request):
    try:
        content_type = request.content_type

        if content_type != "application/json":
            raise ValueError("Unsupported content type")

        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")

        resources = data.get("resources")
        updated_at = datetime.datetime.now(datetime.UTC).isoformat()
        response = []

        for resource in resources:
            metadata = resource.get("metadata")
            id = metadata.get("id")
            content = resource.get("content")
            contexts = metadata.get("contexts")
            values = openai_ef.embed_documents(texts=[content])
            response_item = pc_index.update(
                id=id,
                values=values,
                set_metadata={"text": content, "updated_at": updated_at},
            )
            mongo_collection.update_one(
                {"id": id},
                {
                    "$set": {
                        "text": content,
                        "contexts": contexts,
                        "updated_at": updated_at,
                    }
                },
            )
            response.append(response_item)

        response = response
        return response
    except Exception as e:
        # Propagate the exception
        raise e


@typechecked
def delete_resource_service(request, user_id):
    try:
        content_type = request.content_type

        if content_type != "application/json":
            raise ValueError("Unsupported content type")

        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")

        ids = data.get("resource_ids")
        if not ids:
            raise ValueError("Resource IDs or User ID missing")

        query = {"_id": {"$in": ids}, "user_id": user_id}
        data: List = list(mongo_collection.find(query))
        s3_keys = []
        for item in data:
            mime_type = item.get("type")
            if mime_type.startswith("image/"):
                s3_key = item.get("s3_key")
                s3_keys.append(s3_key)
                if not s3_key:
                    raise ValueError("No S3 key provided")

        if s3_keys:
            delete_s3_objects(s3_keys)

        vectorstore.delete(ids=ids)
        filter = {"id": {"$in": ids}}
        mongo_collection.delete_many(filter)
        return {"message": "Resources deleted successfully"}
    except Exception as e:
        # Propagate the exception
        raise e


@typechecked
def update_resource_context_service(user_id: str, request, context_id: str):
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")

        target_ids: List[str] = data.get("target_ids", [])
        updated_at = datetime.datetime.now(datetime.UTC).isoformat()

        update_data = {
            "$set": {
                "updated_at": updated_at,
                "target_ids": target_ids if target_ids else [],
            }
        }

        mongo_collection.update_one(
            {"_id": context_id, "user_id": user_id}, update_data
        )

        current_docs = mongo_collection.find({"user_id": user_id})
        updates = []

        # Update target_ids
        for target_id in target_ids:
            updates.append(
                pymongo.UpdateOne(
                    {"_id": target_id, "user_id": user_id},
                    {
                        "$addToSet": {"context_ids": context_id},
                        "$set": {"updated_at": updated_at},
                    },
                )
            )

        # Remove context_id from target_ids no longer associated
        removed_target_ids = {
            doc["_id"]
            for doc in current_docs
            if context_id in doc.get("context_ids", []) and doc["_id"] not in target_ids
        }

        for target_id in removed_target_ids:
            updates.append(
                pymongo.UpdateOne(
                    {"_id": target_id, "user_id": user_id},
                    {
                        "$pull": {"context_ids": context_id},
                        "$set": {"updated_at": updated_at},
                    },
                )
            )

        if updates:
            mongo_collection.bulk_write(updates)

        return {"message": "Connections updated successfully"}
    except Exception as e:
        # Propagate the exception
        raise e
