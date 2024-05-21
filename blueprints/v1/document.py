import datetime
import uuid
import chromadb
from flask import Blueprint, jsonify, request
from config import get_db_path
from auth.auth import jwt_required

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
        collection = client.get_or_create_collection("document_collection")
        result = collection.get(ids=ids, where=where)
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
        documents = data.documents
        is_public = data.is_public
        ids = [str(uuid.uuid4()) for _ in documents]
        user_id = data.userId
        created_at = datetime.datetime.now()
        metadatas = []

        for id in ids:
            metadatas.append(
                {
                    "id": ids,
                    "user_id": user_id,
                    "is_public": is_public,
                    "created_at": created_at,
                }
            )

        # Initialize ChromaDB client with persistent storage
        db_path = get_db_path()
        client = chromadb.PersistentClient(path=db_path)
        collection = client.get_or_create_collection("document_collection")
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids,
        )

        return jsonify({"received": data}), 200
        # Handling other content types
    else:
        return jsonify({"error": "Unsupported content type"}), 400
