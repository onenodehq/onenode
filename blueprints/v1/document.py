import datetime
import uuid
import chromadb
from flask import Blueprint, jsonify, request
from config import get_db_path
from auth.auth import jwt_required
from blueprints.v1.utils.chroma_setup import (
    vectorstore,
)  # Import the initialized components

# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_document = Blueprint("document", __name__, url_prefix="/v1/document")


@v1_blueprint_document.route("/", methods=["GET"])
@jwt_required
def get_document():
    ids = request.args.get("document_ids")
    where = request.args.get("where")
    print("id", ids)
    if ids:
        # Initialize ChromaDB client with persistent storage
        db_path = get_db_path()
        client = chromadb.PersistentClient(path=db_path)
        collection = client.get_or_create_collection("resource_collection")
        result = vectorstore.get(ids=ids, where=where)
        return jsonify(result), 200
    else:
        return jsonify({"error": "No document IDs provided"}), 400


@v1_blueprint_document.route("/", methods=["POST"])
@jwt_required
def create_document():
    content_type = request.content_type

    # Handling JSON data
    if content_type == "application/json":
        data = request.get_json()
        # Check for required fields
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        documents = data.get("contents")
        user_id = data.get("user_id")
        types = data.get("types")
        if not documents or not user_id:
            return (
                jsonify(
                    {"error": "Missing required fields: 'documents' and 'user_id'"}
                ),
                400,
            )

        is_public = bool(data.get("is_public", False))
        group_id = data.get("group_id", str(uuid.uuid4()))
        ids = [str(uuid.uuid4()) for _ in documents]
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

        vectorstore.add_documents(
            documents=documents,
            metadatas=metadatas,
            ids=ids,
        )

        response = {
            "contents": documents,
            "metadatas": metadatas,
        }

        return jsonify(response), 200
        # Handling other content types
    else:
        return jsonify({"error": "Unsupported content type"}), 400
