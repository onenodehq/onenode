import base64
import datetime
from io import BytesIO
import io
import os
import re
from typing import Dict, List
import uuid
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from typeguard import typechecked
from api.openai.imageToText import image_to_text
from api.openai.s3 import generate_signed_url, upload_to_s3
from auth.auth import jwt_required
from blueprints.v1.utils.pinecone_setup import (
    vectorstore,
    openai_ef,
    index,
)  # Import the initialized components
from blueprints.v1.utils.s3_setup import EXTENSION_MAP, S3_BUCKET_NAME
from langchain.schema import Document
import logging

load_dotenv()

# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_resource = Blueprint("resource", __name__, url_prefix="/v1/resource")


@v1_blueprint_resource.route("/", methods=["GET"])
@jwt_required
def get_resource(user_id):
    try:
        id = request.args.get("resource_id", "")
        is_admin = request.args.get("is_admin", "") == "True"
        dummy_vector = [0] * 1536

        if is_admin:
            if user_id == os.getenv("ADMIN_ID"):
                data = index.query(
                    vector=dummy_vector,
                    include_metadata=True,
                    top_k=1000,
                )
            else:
                return jsonify({"error": "Failed to authorize admin request"}), 400
        elif id:
            filter = {"id": {"$eq": id}, "user_id": {"$eq": user_id}}
            data = index.query(
                vector=dummy_vector, filter=filter, include_metadata=True, top_k=10
            )
        else:
            filter = {"user_id": {"$eq": user_id}}
            data = index.query(
                vector=dummy_vector, filter=filter, include_metadata=True, top_k=1000
            )

        if not data:
            return jsonify({"error": "No data found for the provided IDs"}), 404

        matches: List = data.get("matches")

        response = []
        for item in matches:
            item_dict = {
                "content": item.get("metadata").get("text"),
                "metadata": item.get("metadata"),
            }
            response.append(item_dict)

        # Sort the response list by updated_at in descending order
        sorted_response = sorted(
            response, key=lambda x: x["metadata"]["updated_at"], reverse=True
        )

        return jsonify(sorted_response), 200
    except Exception as e:

        return jsonify({"error": str(e)}), 500


@v1_blueprint_resource.route("/", methods=["POST"])
@jwt_required
def create_resource(user_id):
    try:
        content_type = request.content_type

        if content_type != "application/json":
            return jsonify({"error": "Unsupported content type"}), 400

        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        resources = data.get("resources")
        if not resources:
            return jsonify({"error": "No resources provided"}), 400

        ids = [str(uuid.uuid4()) for _ in resources]
        created_at = datetime.datetime.now().isoformat()

        documents: List[Document] = []
        response: List[dict] = []

        resources = process_image_resources(resources=resources, ids=ids)

        for i, resource in enumerate(resources):
            metadata = resource.get("metadata")
            content = resource.get("content")
            if not metadata:
                return jsonify({"error": f"Metadata missing for resource {i}"}), 400

            metadata_snake_case = convert_keys_to_snake_case(metadata)
            metadata_snake_case.update(
                {
                    "id": ids[i],
                    "created_at": created_at,
                    "updated_at": created_at,
                    "user_id": user_id,
                }
            )

            print("metadata,", metadata_snake_case)

            document = Document(
                metadata=metadata_snake_case,
                page_content=content,
            )
            documents.append(document)
            response_metadata = metadata_snake_case.copy()
            response_metadata.update(
                {"s3_key": generate_signed_url(metadata_snake_case["s3_key"])}
            )
            response_item = {
                "content": content,
                "metadata": response_metadata,
            }
            print("s3ke", metadata_snake_case["s3_key"])
            response.append(response_item)
            print("response", response)

        vectorstore.add_documents(documents=documents, ids=ids)
        return jsonify(response), 200

    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        # Consider using proper logging here
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@v1_blueprint_resource.route("/", methods=["PUT"])
@jwt_required
def update_resources(user_id):
    try:
        content_type = request.content_type

        # Handling JSON data
        if content_type == "application/json":
            data = request.get_json()
            # Check for required fields
            if not data:
                return jsonify({"error": "No JSON data provided"}), 400

            resources = data.get("resources")

            updated_at = datetime.datetime.now(datetime.UTC).isoformat()
            response = []

            for resource in resources:
                # Update
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
            return jsonify(response), 200

        else:
            return jsonify({"error": "Unsupported content type"}), 400

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


def to_snake_case(s):
    """Convert a string to snake_case."""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower().replace("-", "_")


def convert_keys_to_snake_case(d):
    """Convert all keys in a dictionary to snake_case recursively."""
    if not isinstance(d, dict):
        return d
    new_dict = {}
    for k, v in d.items():
        new_key = to_snake_case(k)
        if isinstance(v, dict):
            new_dict[new_key] = convert_keys_to_snake_case(v)
        else:
            new_dict[new_key] = v
    return new_dict


@v1_blueprint_resource.route("/", methods=["DELETE"])
@jwt_required
def delete_resource(user_id):
    try:
        content_type = request.content_type

        # Handling JSON data
        if content_type == "application/json":
            data = request.get_json()
            # Check for required fields
            if not data:
                return jsonify({"error": "No JSON data provided"}), 400

            ids = data.get("resource_ids")

            if not ids:
                return jsonify({"error": "Resource IDs or User iD missing"}), 400

            vectorstore.delete(ids=ids)

            return jsonify({"message": "Resources deleted successfully"}), 200

        else:
            return jsonify({"error": "Unsupported content type"}), 400

    except Exception as e:
        logging.error(f"Error deleting resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@typechecked
def process_image_resources(resources: List[Dict], ids: List[str]) -> List[Dict]:
    updated_resources = []

    for i, resource in enumerate(resources):
        try:
            metadata = resource.get("metadata", {})
            mime_type = metadata.get("type")
            if not mime_type:
                raise ValueError("Missing MIME type for image")
            if mime_type.startswith("image/"):
                base64_image: str = resource.get("content")
                if not base64_image or not isinstance(base64_image, str):
                    raise ValueError("Content for image must be a base64 string")

                # Analyze the images using the new analyze_images function
                print("call api \n")
                content = image_to_text(base64_image)

                print("iamge to text result", content)

                extension = EXTENSION_MAP.get(mime_type, "bin")
                filename = f"{ids[i]}.{extension}"
                save_base64_image(base64_image=base64_image, filename=filename)

                s3_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{filename}"

                metadata["s3_key"] = filename
                resource["metadata"] = metadata
                resource["content"] = content

            updated_resources.append(resource)

        except Exception as e:
            logging.error(f"Error processing image resource: {e}")
            raise RuntimeError(f"Failed to process resource content: {str(e)}")

    return updated_resources


def save_base64_image(base64_image, filename):
    try:
        # Check if the base64 string has metadata and extract content type if available
        if base64_image.startswith("data:"):
            header, base64_image = base64_image.split(",", 1)
            content_type = header.split(";")[0].split(":")[1]
        else:
            content_type = (
                "application/octet-stream"  # Default content type if not specified
            )

        # Decode the base64 string
        binary_image = base64.b64decode(base64_image)
        file_binary = io.BytesIO(binary_image)

        # Upload to S3
        upload_to_s3(file_binary, filename, content_type)

    except (base64.binascii.Error, ValueError) as e:
        logging.error(f"Failed to process base64 image: {e}")
        raise RuntimeError(f"Failed to save image to S3: {str(e)}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise RuntimeError(f"Failed to save image to S3: {str(e)}")
