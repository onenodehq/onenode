import datetime
import json
from typing import Dict, List
import uuid
import chromadb
from flask import Blueprint, jsonify, request
from config import get_db_path
from auth.auth import jwt_required
from blueprints.v1.utils.pinecone_setup import (
    vectorstore,
    index,
)  # Import the initialized components

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

            contents = data.get("contents")
            user_id = data.get("user_id")
            types = data.get("types")
            if not contents or not user_id:
                return (
                    jsonify(
                        {"error": "Missing required fields: 'contents' and 'user_id'"}
                    ),
                    400,
                )

            semantic_texts = []
            for content in contents:
                semantic_texts.append(content)

            is_public = bool(data.get("is_public", False))
            group_id = data.get("group_id", str(uuid.uuid4()))
            ids = [str(uuid.uuid4()) for _ in semantic_texts]
            created_at = datetime.datetime.now(datetime.UTC).isoformat()
            metadatas = []

            for i, id in enumerate(ids):
                metadatas.append(
                    {
                        "id": id,
                        "type": types[i],
                        "user_id": user_id,
                        "is_public": str(is_public),
                        "created_at": created_at,
                        "updated_at": created_at,
                        "group_id": group_id,
                    }
                )

            vectorstore.add_texts(texts=semantic_texts, metadatas=metadatas)

            response = {
                "contents": semantic_texts,
                "metadatas": metadatas,
            }

            return jsonify(response), 200

        else:
            return jsonify({"error": "Unsupported content type"}), 400

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
