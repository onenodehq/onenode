from uuid import uuid4
from bson import ObjectId
from flask import abort
from typeguard import typechecked
from blueprints.v1.utils.openai_operations import embed_texts
from errors import PathNotFoundError
from langchain_text_splitters import RecursiveCharacterTextSplitter
from blueprints.v1.utils.pinecone_setup import pc_client_index
from blueprints.v1.utils.mongo_setup import mongo_client_db


@typechecked
def process_document(documents: list[dict], namespace: str) -> list[dict]:
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection '{namespace}' not found")

    all_chunks: list[str] = []
    all_metadatas: list[dict] = []
    document_ids: list[ObjectId] = []

    for document in documents:
        targets: list = document.get("_targets", [])
        document_ids.append(ObjectId())

        for target in targets:
            data, final_key = get_target(document=document, target=target)
            text = data[final_key]
            chunks = chunk(text=text)
            replacement = {"text": text, "chunks": chunks}
            data[final_key] = replacement
            metadatas = create_metadata(
                document_id=str(document_ids[-1]), target=target, length=len(chunks)
            )
            all_chunks.extend(chunks)
            all_metadatas.extend(metadatas)

    embeddings = embed_texts(texts=all_chunks)
    vectors = []
    for i, embedding in enumerate(embeddings):
        vector = {"id": str(uuid4()), "values": embedding, "metadata": all_metadatas[i]}
        vectors.append(vector)

    mongo_collection.insert_many(documents=documents)
    pc_client_index.upsert(vectors=vectors, namespace=namespace)

    result = documents

    return result


def get_target(document: dict, target: str):
    keys = target.split(".")
    data = document

    for key in keys[:-1]:  # Traverse until the second last key
        if key in data and isinstance(
            data[key], dict
        ):  # Ensure the path is valid and the value is a dict
            data = data[key]
        else:
            raise PathNotFoundError(target)

    final_key = keys[-1]  # The target key
    if final_key in data:
        return data, final_key
    else:
        raise PathNotFoundError(target)


def chunk(text: str) -> list[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        # Set a really small chunk size, just to show.
        chunk_size=200,
        chunk_overlap=20,
        length_function=len,
        is_separator_regex=False,
    )
    texts = text_splitter.split_text(text=text)

    return texts


def create_metadata(document_id: str, target: str, length: int) -> list[dict]:
    metadatas = []
    for i in range(length):
        metadata = {"document_id": document_id, "target": target, "seq": i}
        metadatas.append(metadata)
    return metadatas


def delete_documents_service(filter: dict, namespace: str):
    mongo_collection = mongo_client_db.get_collection(name=namespace)
    if mongo_collection is None:
        abort(404, description=f"Collection not found")

    documents_to_delete = mongo_collection.find(filter=filter, projection={"_id": 1})
    ids_to_delete = [doc["_id"] for doc in documents_to_delete]

    mongo_collection.delete_many(filter=filter)

    pc_filter = {"document_id": {"$in": ids_to_delete}}
    pc_client_index.delete(filter=pc_filter, namespace=namespace)
    return
