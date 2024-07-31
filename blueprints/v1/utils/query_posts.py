import chromadb
import os
import chromadb.errors
from config import get_db_path
import chromadb.utils.embedding_functions as embedding_functions


def query_posts(query, n_results, is_public, user_id):
    db_path = get_db_path()
    client = chromadb.PersistentClient(path=db_path)
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=os.environ.get("OPENAI_API_KEY"),
        model_name="text-embedding-ada-002",
    )
    collection = client.get_or_create_collection(
        "content_collection", embedding_function=openai_ef
    )

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
    return results
