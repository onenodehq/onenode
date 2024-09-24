from flask import abort
from langchain_text_splitters import RecursiveCharacterTextSplitter
from blueprints.v1.models.emb_image import EmbImage
from blueprints.v1.models.emb_text import EmbText
from blueprints.v1.utils.pinecone_operations import (
    create_vector_bases,
    generate_pc_id_prefix,
    pc_delete_with_doc_ids,
)
from blueprints.v1.utils.openai_operations import image_to_text


# Recursively check each field for the '@' prefix
def process_document_fields(
    data: dict,
    project_id: str,
    db_name: str,
    collection_name: str,
    doc_id: str,
    parent_path: str = "",
) -> list:
    all_vector_bases = []
    if isinstance(data, dict):
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
                metadata = {
                    "project_id": project_id,
                    "db_name": db_name,
                    "collection_name": collection_name,
                    "doc_id": doc_id,
                    "path": parent_path,
                    "type": "text",
                }

                vector_bases = create_vector_bases(
                    chunks,
                    metadata,
                    project_id,
                    db_name,
                    collection_name,
                    doc_id,
                    parent_path,
                )
                all_vector_bases.extend(vector_bases)

            elif key == "@embImage":
                if not EmbImage.is_valid_data(data=data):
                    abort(400, description=f"Field value is invalid - {data}")
                value: dict

                mime_type: str = value.get("mimeType")
                base64_image: str = value.pop("data")

                if mime_type.startswith("image/"):
                    text = image_to_text(base64_image=base64_image, mime_type=mime_type)
                    chunks = chunk(text=text)
                    value["chunks"] = chunks
                    value["text"] = text
                    metadata = {
                        "project_id": project_id,
                        "db_name": db_name,
                        "collection_name": collection_name,
                        "doc_id": doc_id,
                        "path": parent_path,
                        "type": "image",
                    }

                    vector_bases = create_vector_bases(
                        chunks,
                        metadata,
                        project_id,
                        db_name,
                        collection_name,
                        doc_id,
                        parent_path,
                    )
                    all_vector_bases.extend(vector_bases)

            elif isinstance(value, dict):
                process_document_fields(
                    data=value,
                    project_id=project_id,
                    db_name=db_name,
                    collection_name=collection_name,
                    doc_id=doc_id,
                    parent_path=current_path,
                )
    elif isinstance(data, list):
        for item in data:
            process_document_fields(
                data=item,
                project_id=project_id,
                db_name=db_name,
                collection_name=collection_name,
                doc_id=doc_id,
                parent_path=current_path,
            )
    return all_vector_bases


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


def prepare_update_fields(
    operator: str,
    fields: dict,
    project_id: str,
    db_name: str,
    collection_name: str,
    doc_ids: list[str],
    non_emb_paths: list[str],
) -> list:
    if not isinstance(fields, dict):  # Check if fields is not a dictionary
        abort(
            400,
            description=f"Expected dictionary for {operator}, but got {type(fields).__name__} instead.",
        )
    all_vector_bases = []
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

            text = new_value["embText"]["text"]
            chunks = chunk(text=text)
            new_value["embText"]["chunks"] = chunks
            metadata = {
                "project_id": project_id,
                "db_name": db_name,
                "collection_name": collection_name,
                "path": path,
                "type": "text",
            }

            for doc_id in doc_ids:
                vector_bases = create_vector_bases(
                    chunks,
                    metadata,
                    project_id,
                    db_name,
                    collection_name,
                    doc_id,
                    path,
                )
                all_vector_bases.extend(vector_bases)

        elif new_value.get("@embImage"):
            if not EmbImage.is_valid_data(data=new_value):
                abort(400, description=f"Field value is invalid - {new_value}")

            if operator not in ["$set", "$unset"]:
                abort(
                    400,
                    description=f"Invalid update operator: '{operator}'. Allowed operators for {path} are '$set' and '$unset'.",
                )

            mime_type: str = new_value["@embImage"].get("mimeType")
            content_data: str = new_value["@embImage"].pop("data")

            if mime_type.startswith("image/"):
                text = image_to_text(base64_image=content_data, mime_type=mime_type)
                chunks = chunk(text=text)
                new_value["@embImage"]["chunks"] = chunks
                new_value["@embImage"]["text"] = text
                metadata = {
                    "project_id": project_id,
                    "db_name": db_name,
                    "collection_name": collection_name,
                    "path": path,
                    "type": "image",
                }
                for doc_id in doc_ids:
                    vector_bases = create_vector_bases(
                        chunks,
                        metadata,
                        project_id,
                        db_name,
                        collection_name,
                        doc_id,
                        path,
                    )
                    all_vector_bases.extend(vector_bases)

        else:
            non_emb_paths.append(path)

    return all_vector_bases


def delete_pc_vectors(
    doc_ids: list[str],
    non_emb_paths: list[str],
    project_id: str,
    db_name: str,
    collection_name: str,
):
    delete_id_prefixes: list[str] = []
    for doc_id in doc_ids:
        for path in non_emb_paths:
            delete_id_prefix = generate_pc_id_prefix(
                project_id,
                db_name,
                doc_id,
                path,
            )
            delete_id_prefixes.append(delete_id_prefix)

    if delete_id_prefixes:
        pc_delete_with_doc_ids(project_id, db_name, collection_name, doc_ids)


def create_pc_id_suffixes(path: str, length: int) -> list[str]:
    pc_id_suffixes = []
    path = path.replace(".", "#")
    for i in range(length):
        pc_id_suffix = path + "#" + str(i)
        pc_id_suffixes.append(pc_id_suffix)
    return pc_id_suffixes
