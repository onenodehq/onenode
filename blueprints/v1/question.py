import os
from flask import Blueprint, jsonify, request, Response
import json
from langchain_openai import ChatOpenAI
from typeguard import typechecked
from auth.auth import jwt_required
from blueprints.v1.utils.openai_operations import (
    contextualize_question,
    get_contextual_response,
    get_embedding,
)
from blueprints.v1.utils.pinecone_setup import (
    pc_index,
)  # Import the initialized components
from blueprints.v1.utils.mongo_setup import mongo_collection
from blueprints.v1.utils.question_helper import (
    docs_to_context,
    format_to_openai_messages,
)


# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_question = Blueprint("question", __name__, url_prefix="/v1/question")


@v1_blueprint_question.route("/", methods=["POST"])
@jwt_required  # JWT token required for authorization
@typechecked
def generate_response(user_id: str):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body must be JSON"}), 400

    question = data.get("question")
    is_public = data.get("is_public")
    chat_history = data.get("chat_history", [])

    chat_history = format_to_openai_messages(chat_history)

    if not all([question, is_public]):
        return (
            jsonify(
                {
                    "message": "Missing one or more required fields: 'question', 'is_public', 'user_id'"
                }
            ),
            400,
        )

    try:
        llm = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4"), temperature=0)
        contextualized_q = contextualize_question(
            question=question, chat_history=chat_history
        )
        query_vector = get_embedding(text=contextualized_q)

        pc_filter = {"user_id": user_id}
        pc_ids = [
            match["id"]
            for match in pc_index.query(
                vector=query_vector, top_k=20, filter=pc_filter
            ).get("matches", [])
        ]

        mongo_filter = {"_id": {"$in": pc_ids}, "user_id": user_id}
        mongo_docs = list(
            mongo_collection.find(filter=mongo_filter, projection={"_id": 0})
        )

        context = docs_to_context(docs=mongo_docs)

        return Response(
            get_contextual_response(question, chat_history, context),
            mimetype="text/plain",
        )

    except Exception as e:
        print("An error occurred:", e)
        return jsonify({"error": str(e)}), 500
