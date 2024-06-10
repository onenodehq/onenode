import asyncio
from asyncore import loop
import datetime
import json
import re
import time
from typing import Dict, List
import uuid
import chromadb
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
        # Parse where_clause as a dictionary
        filter = json.loads(request.args.get("where", "{}"))

        data = index.query(filter=filter)

        if not data:
            return jsonify({"error": "No data found for the provided IDs"}), 404

        metadatas = data.get("metadatas")
        semantic_texts = metadatas.get("texts")

        if semantic_texts is None or metadatas is None:
            return jsonify({"error": "Malformed data returned from collection"}), 500

        response: List[Dict] = [
            {"content": semantic_texts[i], "metadata": metadatas[i]}
            for i in range(len(data.get("ids")))
        ]

        return jsonify(response), 200

    except Exception as e:
        # Log the exception if needed
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
