from flask import abort, request
from langchain_text_splitters import RecursiveCharacterTextSplitter
from blueprints.v1.models.emb_content import EmbContent
from blueprints.v1.models.emb_text import EmbText
from blueprints.v1.utils.pinecone_operations import (
    pc_client_delete_with_prefixes,
    pc_client_upsert,
)
from blueprints.v1.utils.openai_operations import embed_texts, image_to_text


# Recursively check each field for the '@' prefix
def process_document_fields(
    data: dict,
    document_id: str,
    all_chunks: list[str],
    all_pc_ids: list[dict],
    parent_path: str = "",
):
    for key, value in data.items():
        if parent_path:
            current_path = f"{parent_path}.{key}"
        else:
            current_path = f"{key}"

        if not isinstance(key, str):
            abort(400, description=f"Key name must be a string - {key}")

        if key == "@embText":
            if not EmbText.is_valid_data(data=data):
                abort(400, description=f"Field value is invalid - {data}")
            value: dict

            text = value.get("text")
            chunks = chunk(text=text)
            value["chunks"] = chunks
            pc_ids = create_pc_ids(
                path=parent_path, length=len(chunks), document_id=document_id
            )

            all_chunks.extend(chunks)
            all_pc_ids.extend(pc_ids)
        elif key == "@embContent":
            if not EmbContent.is_valid_data(data=data):
                abort(400, description=f"Field value is invalid - {data}")
            value: dict

            mime_type: str = value.get("mimeType")
            base64_image: str = value.pop("data")

            if mime_type.startswith("image/"):
                text = image_to_text(base64_image=base64_image, mime_type=mime_type)
                chunks = chunk(text=text)
                value["chunks"] = chunks
                value["text"] = text
                pc_ids = create_pc_ids(
                    path=parent_path, length=len(chunks), document_id=document_id
                )

                all_chunks.extend(chunks)
                all_pc_ids.extend(pc_ids)

        elif isinstance(value, dict):
            process_document_fields(
                data=value,
                document_id=document_id,
                all_chunks=all_chunks,
                all_pc_ids=all_pc_ids,
                parent_path=current_path,
            )
    return


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


def create_vectors(embeddings: list, pc_ids: list[str]) -> list:
    if not len(embeddings) == len(pc_ids):
        abort(500, description="Internal server error - 1002")
    vectors = []
    for i, embedding in enumerate(embeddings):
        vector = {
            "id": pc_ids[i],
            "values": embedding,
        }
        vectors.append(vector)
    return vectors


def prepare_update_fields(
    operator: str,
    fields: dict,
    all_chunks: list,
    all_pc_id_suffixes: list[str],
    non_emb_paths: list[str],
):
    for path, new_value in fields.items():
        if not isinstance(path, str):
            abort(400, description=f"Path must be a string - {path}")

        if new_value.get("@embText"):
            if not EmbText.is_valid_data(data=new_value):
                abort(400, description=f"Field value is invalid - {new_value}")

            if operator not in ["$set", "$unset"]:
                abort(
                    400,
                    description=f"Invalid update operator: '{operator}'. Allowed operators for {path} are '$set' and '$unset'.",
                )

            text = new_value["text"]
            chunks = chunk(text=text)
            pc_id_suffixes = create_pc_id_suffixes(path=path, length=len(chunks))
            all_pc_id_suffixes.extend(pc_id_suffixes)
            new_value["chunks"] = chunks
            all_chunks.extend(chunks)
        elif new_value.get("@embContent"):
            if not EmbContent.is_valid_data(data=new_value):
                abort(400, description=f"Field value is invalid - {new_value}")

            if operator not in ["$set", "$unset"]:
                abort(
                    400,
                    description=f"Invalid update operator: '{operator}'. Allowed operators for {path} are '$set' and '$unset'.",
                )

            mime_type: str = new_value["@embContent"].get("mimeType")
            content_data: str = new_value["@embContent"].pop("data")

            if mime_type.startswith("image/"):
                text = image_to_text(base64_image=content_data, mime_type=mime_type)
                chunks = chunk(text=text)
                new_value["@embContent"]["chunks"] = chunks
                new_value["@embContent"]["text"] = text
                pc_id_suffixes = create_pc_id_suffixes(path=path, length=len(chunks))
                all_pc_id_suffixes.extend(pc_id_suffixes)
                all_chunks.extend(chunks)

        else:
            non_emb_paths.append(path)


def update_pc(
    document_ids: list[str],
    all_chunks: list[str],
    all_pc_id_suffixes: list[str],
    non_emb_paths: list[str],
    namespace: str,
):
    if not len(all_pc_id_suffixes) == len(all_chunks):
        abort(400, description="Internal Server Error = 1003")

    delete_id_prefixes: list[str] = []
    embeddings = embed_texts(texts=all_chunks)
    all_vectors = []
    for document_id in document_ids:
        pc_ids = [document_id + pc_id_suffix for pc_id_suffix in all_pc_id_suffixes]
        vectors = create_vectors(embeddings=embeddings, pc_ids=pc_ids)
        all_vectors.extend(vectors)

        for path in non_emb_paths:
            delete_id_prefix = create_pc_id_prefixes(document_id=document_id, path=path)
            delete_id_prefixes.append(delete_id_prefix)

    if delete_id_prefixes:
        pc_client_delete_with_prefixes(prefixes=delete_id_prefixes, namespace=namespace)
    if all_pc_id_suffixes:
        pc_client_upsert(vectors=all_vectors, namespace=namespace)


def create_pc_ids(document_id: str, path: str, length: int) -> list[str]:
    pc_ids = []
    path = path.replace(".", "-")
    for i in range(length):
        pc_id = document_id + "-" + path + "#" + str(i)
        pc_ids.append(pc_id)
    return pc_ids


def create_pc_id_prefixes(document_id: str, path: str) -> list:
    path = path.replace(".", "-")
    pc_id_prefix = document_id + "-" + path + "#"
    return pc_id_prefix


def create_pc_id_suffixes(path: str, length: int) -> list[str]:
    pc_id_suffixes = []
    path = path.replace(".", "-")
    for i in range(length):
        pc_id_suffix = "-" + path + "#" + str(i)
        pc_id_suffixes.append(pc_id_suffix)
    return pc_id_suffixes


def validate_json_content_type():
    if request.content_type != "application/json":
        abort(400, description="Invalid content type. Expected 'application/json'.")
