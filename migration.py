from ast import Or
import datetime
import re
from uuid import uuid4
import chromadb
from config import get_db_path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def migrate():
    try:
        db_path = get_db_path()
        client = chromadb.PersistentClient(path=db_path)
        prev_collection = client.get_or_create_collection("content_collection")
        new_collection = client.get_or_create_collection("document_collection")

        if len(prev_collection.get()["ids"]) != prev_collection.count():
            logging.error("Mismatch in data count for previous collection.")
            raise

        data = prev_collection.get()
        documents = data["documents"]
        metadatas = data["metadatas"]

        for i, document in enumerate(documents):
            items = extract_list_items_or_text(document)
            group_id = str(uuid4())
            for item in items:
                try:
                    print("metadata", metadatas[i])
                    if "userId" not in metadatas[i] or "createdAt" not in metadatas[i] or "updatedAt" not in metadatas[i]:
                        print("skip: not enough data")
                        continue

                    
                    id = str(uuid4())
                    created_at = convert_iso_format(metadatas[i]["createdAt"])
                    updated_at = convert_iso_format(metadatas[i]["updatedAt"])

                    new_collection.add(
                        documents=[item],
                        metadatas=[
                            {
                                "id": id,
                                "user_id": metadatas[i]["userId"],
                                "group_id": group_id,
                                "created_at": created_at,
                                "updated_at": updated_at,
                            }
                        ],
                        ids=[id],
                    )
                    logging.info(f"Added document ID: {id} to new collection.")
                except Exception as e:
                    logging.error(f"Failed to add item: {item} with error: {e}")
                    raise  # Stop execution if there is any error
        print(new_collection.get())
        print("\nsuccessfully migrated.\n")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        client.delete_collection("document_collection")  # Delete the new collection on error


def convert_iso_format(iso_string):
    """
    Convert an ISO 8601 string with a 'Z' (indicating UTC) to the same format as datetime.utcnow().isoformat().

    Parameters:
    iso_string (str): The ISO 8601 string to convert.

    Returns:
    str: The converted ISO 8601 string in the format of datetime.utcnow().isoformat().
    """
    try:
        # Convert the ISO 8601 string to a datetime object
        dt = datetime.datetime.strptime(iso_string, "%Y-%m-%dT%H:%M:%S.%fZ")
        # Convert back to ISO 8601 string without the 'Z' and with appropriate precision
        return dt.isoformat(timespec="milliseconds")
    except ValueError as e:
        logging.error(f"Invalid date format: {iso_string} with error: {e}")
        return None


def extract_list_items_or_text(markdown_str):
    # Use regular expression to find all list items
    list_items = re.findall(r"\*   (.+)", markdown_str)

    # If no list items found, return the original text
    if not list_items:
        return [markdown_str]

    return list_items
