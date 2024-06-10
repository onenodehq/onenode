import asyncio
import datetime
import json
import re
from typing import Dict, List
import uuid
from flask import Blueprint, jsonify, request
from config import get_db_path
from auth.auth import jwt_required
from blueprints.v1.utils.pinecone_setup import (
    vectorstore,
    openai_ef,
    index,
)  # Import the initialized components
from langchain.schema import Document

# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_resource = Blueprint("resource", __name__, url_prefix="/v1/resource")


@v1_blueprint_resource.route("/", methods=["GET"])
@jwt_required
def get_resource():
    try:
        id = request.args.get("resource_id", "")
        dummy_vector = [0] * 1536

        if id:
            filter = {"id": {"$eq": id}}
            data = index.query(
                vector=dummy_vector, filter=filter, include_metadata=True, top_k=10
            )
        else:
            data = index.query(
                vector=dummy_vector, include_metadata=True, top_k=1000
            )

        if not data:
            return jsonify({"error": "No data found for the provided IDs"}), 404

        matches: List = data.get("matches")

        response = []
        for item in matches:
            item_dict = {
                "content": item.get("metadata").get("text"),
                'metadata': item.get("metadata"),
            }
            response.append(item_dict)

        # Sort the response list by updated_at in descending order
        sorted_response = sorted(response, key=lambda x: x['metadata']['updated_at'], reverse=True)

        return jsonify(sorted_response), 200
    except Exception as e:

        return jsonify({"error": str(e)}), 500


@v1_blueprint_resource.route("/", methods=["POST"])
@jwt_required
def create_resource():
    try:
        content_type = request.content_type

        # Handling JSON data
        if content_type == "application/json":
            data = request.get_json()
            # Check for required fields
            if not data:
                return jsonify({"error": "No JSON data provided"}), 400

            resources = data.get("resources")

            ids = [str(uuid.uuid4()) for _ in resources]
            created_at = datetime.datetime.now(datetime.UTC).isoformat()
            documents: List[Document] = []

            for i, resource in enumerate(resources):
                metadata = resource.get("metadata")
                metadata_snake_case = convert_keys_to_snake_case(metadata)
                metadata_snake_case.update(
                    {
                        "id": ids[i],
                        "created_at": created_at,
                        "updated_at": created_at,
                    }
                )
                document = Document(
                    metadata=metadata_snake_case, page_content=resource.get("content")
                )
                documents.append(document)

            vectorstore.add_documents(documents=documents, ids=ids)

            response = resources

            return jsonify(response), 200

        else:
            return jsonify({"error": "Unsupported content type"}), 400

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


def run_async_task(async_func, *args):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(async_func(*args))
    loop.close()
    return result


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
