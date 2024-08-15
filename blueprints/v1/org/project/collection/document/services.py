from uuid import uuid4
from flask import abort
from openai import embeddings
from blueprints.v1.utils.openai_operations import embed_texts
from errors import PathNotFoundError
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pymongo.collection import Collection
from blueprints.v1.utils.pinecone_setup import pc_client_index
from blueprints.v1.utils.mongo_setup import mongo_client_db


def process_document(document: dict, monogo_collection: Collection) -> dict:
    targets: list = document.get("_targets", [])

    all_vectors = []
    for target in targets:
        vectors = process_target(document, target)
        all_vectors.extend(vectors)

    insert_result = monogo_collection.insert_one(document=document)
    document_id = str(insert_result.inserted_id)

    if all_vectors:
        for vector in all_vectors:
            vector["metadata"]["document_id"] = document_id
            vector["id"] = str(uuid4())

        pc_client_index.upsert(vectors=vectors)

    document["_id"] = insert_result.inserted_id
    result = document

    return result


def process_target(document: dict, field_path: str) -> list[dict]:
    keys = field_path.split(".")  # filed_path example) some.filed.to.embed
    data = document
    for key in keys[:-1]:
        if key in data:
            data = data[key]
        else:
            raise PathNotFoundError(field_path)

    if keys[-1] in data:
        text = data[keys[-1]]
        chunks = chunk(text)
        data[keys[-1]] = {
            "text": text,
            "chunks": chunks,
        }
        embeddings = embed_texts(chunks)
        metadatas = create_metadata(field_path=field_path, length=len(chunks))
        vectors = combine_embs_and_metadata(embeddings=embeddings, metadatas=metadatas)

        return vectors
    else:
        raise PathNotFoundError(field_path)


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


def combine_embs_and_metadata(embeddings: list[list[int]], metadatas: list[dict]):
    vectors: list[dict] = []
    for i in range(len(embeddings)):
        vectors.append({"values": embeddings[i], "metadata": metadatas[i]})

    return vectors


def create_metadata(field_path: str, length: int) -> list[dict]:
    metadatas = []
    for i in range(length):
        metadata = {"field_path": field_path, "seq": i}
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
