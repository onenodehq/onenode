import chromadb
from flask import Blueprint, request, jsonify
from config import get_db_path

v1_blueprint_query = Blueprint("query", __name__, url_prefix="/v1/query")


@v1_blueprint_query.route("/", methods=["GET"])  # Adjust '/your_endpoint' as needed
def query_posts():

    query = request.args.get("query")
    n_results = request.args.get("nResults", default=20, type=int)
    is_public = request.args.get("isPublic")
    user_id = request.args.get("userId")

    if not query or is_public is None:
        return jsonify({"message": "Query not found in the API request."}), 400

    db_path = get_db_path()
    client = chromadb.PersistentClient(path=db_path)
    collection = client.get_or_create_collection("post_collection")

    try:
        if is_public == "true":
            results = collection.query(
                n_results=n_results,
                query_texts=[query],
                include=["documents", "metadatas"],
                where={"isPublic": "true"},
            )
        else:
            results = collection.query(
                n_results=n_results,
                query_texts=[query],
                include=["documents", "metadatas"],
                where={"userId": user_id},
            )
        return jsonify({"message": "Success", "status": 200, "items": results})
    except Exception as e:
        print(f"An Error was caught:\n{e}")
        return jsonify({"message": "Internal Server Error"}), 500
