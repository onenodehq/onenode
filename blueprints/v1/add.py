import chromadb
from flask import Blueprint, request, jsonify, current_app
from config import get_db_path

v1_blueprint_add = Blueprint("add", __name__, url_prefix="/v1/add")


@v1_blueprint_add.route("/", methods=["POST"])
def add_post():
    # Ensure request is JSON
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    try:
        # Use an application config or environment variable for db path
        db_path = get_db_path()
        client = chromadb.PersistentClient(path=db_path)
        collection = client.get_or_create_collection("post_collection")

        body = request.json
        required_fields = [
            "content",
            "userId",
            "postId",
            "createdAt",
            "updatedAt",
            "isPublic",
        ]
        if not all(field in body for field in required_fields):
            return jsonify({"error": "Missing required field(s)"}), 400

        # Add validation for data types here if needed

        collection.add(
            documents=[body["content"]],
            metadatas=[
                {
                    "userId": body["userId"],
                    "prod": body.get("prod", False),  # Optional, defaults to False
                    "createdAt": body["createdAt"],
                    "updatedAt": body["updatedAt"],
                    "isPublic": body["isPublic"],
                }
            ],
            ids=[body["postId"]],
        )

        return jsonify({"message": "Post added successfully"}), 201
    except Exception as e:
        current_app.logger.error(f"An error occurred during the post addition: {e}")
        return jsonify({"error": "An error occurred during the post addition"}), 500
