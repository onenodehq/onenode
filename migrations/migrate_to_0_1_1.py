import datetime
from importlib import metadata
import re
from uuid import uuid4
import chromadb
from langchain_openai import OpenAIEmbeddings
from config import get_db_path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def migrate_to_0_1_0():
    try:
        db_path = get_db_path()
        client = chromadb.PersistentClient(path=db_path)
        prev_collection = client.get_or_create_collection("document_collection")
        openai_ef = OpenAIEmbeddings(model="text-embedding-ada-002")
        new_collection = client.get_or_create_collection(
            "resource_collection", embedding_function=openai_ef
        )

        data = prev_collection.get()
        documents = data["documents"]
        metadatas = data["metadatas"]

        for i, document in enumerate(documents):
            try:
                new_collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=metadatas.get("ids"),
                )
                logging.info(f"Added document ID: {id} to new collection.")
            except Exception as e:
                logging.error(f"Failed to add item: {item} with error: {e}")
                raise  # Stop execution if there is any error
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        client.delete_collection(
            "resource_collection"
        )  # Delete the new collection on error
