import datetime
import os
import uuid
from typing import List
from blueprints.v1.utils.pinecone_setup import vectorstore, index, openai_ef
from langchain.schema import Document
from blueprints.v1.utils.helpers import convert_keys_to_snake_case
from blueprints.v1.utils.s3_operations import generate_signed_url, process_image_resources

def get_resource_service(request, user_id):
    try:
        id = request.args.get("resource_id", "")
        is_admin = request.args.get("is_admin", "") == "True"
        dummy_vector = [0] * 1536

        if is_admin:
            if user_id == os.getenv("ADMIN_ID"):
                data = index.query(vector=dummy_vector, include_metadata=True, top_k=1000)
            else:
                raise PermissionError("Failed to authorize admin request")
        elif id:
            filter = {"id": {"$eq": id}, "user_id": {"$eq": user_id}}
            data = index.query(vector=dummy_vector, filter=filter, include_metadata=True, top_k=10)
        else:
            filter = {"user_id": {"$eq": user_id}}
            data = index.query(vector=dummy_vector, filter=filter, include_metadata=True, top_k=1000)

        if not data:
            raise ValueError("No data found for the provided IDs")

        matches: List = data.get("matches")
        response = []

        for item in matches:
            metadata = item.get("metadata")
            if metadata.get("type").startswith("image/"):
                metadata.update({"s3_key": generate_signed_url(metadata.get("s3_key"))})
            item_dict = {
                "content": metadata.get("text"),
                "metadata": metadata,
            }
            response.append(item_dict)

        sorted_response = sorted(response, key=lambda x: x["metadata"]["updated_at"], reverse=True)
        return sorted_response
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

        resources = process_image_resources(resources=resources, ids=ids)
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
                response_metadata.update({"s3_key": generate_signed_url(metadata_snake_case["s3_key"])})
            response_item = {
                "content": content,
                "metadata": response_metadata,
            }

            response.append(response_item)

        vectorstore.add_documents(documents=documents, ids=ids)
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
            values = openai_ef.embed_documents(texts=[content])
            response_item = index.update(
                id=id,
                values=values,
                set_metadata={"text": content, "updated_at": updated_at},
            )
            response.append(response_item)
        return response
    except Exception as e:
        # Propagate the exception
        raise e


def delete_resource_service(request):
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

        vectorstore.delete(ids=ids)
        return {"message": "Resources deleted successfully"}
    except Exception as e:
        # Propagate the exception
        raise e