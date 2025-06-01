from langchain_text_splitters import RecursiveCharacterTextSplitter
from blueprints.v0.ejson.image import (
    Image,
)
from blueprints.v0.ejson.text import (
    Text,
)
from blueprints.v0.utils.pinecone_operations import (
    create_vector_bases,
    delete_pc_vectors_by_id_prefix,
    generate_pc_id_prefix,
)
from blueprints.v0.utils.s3_operations import (
    delete_s3_objects_with_prefix,
    generate_object_key,
    generate_object_key_prefix,
)
from errors import CustomAPIError


# Recursively check each field for the '@' prefix
def process_document(
    data: dict | list,
    project_id: str,
    db_name: str,
    collection_name: str,
    doc_ids: list,
    parent_path: str = "",
    request_files: dict = None,
    doc_index: int = 0,
) -> dict:
    all_vector_bases = []
    emb_image_refs = []
    if isinstance(data, dict):
        for key, value in data.items():
            if parent_path:
                current_path = f"{parent_path}.{key}"
            else:
                current_path = f"{key}"

            if not isinstance(key, str):
                raise CustomAPIError(
                    f"Invalid document structure: Key name must be a string, got {type(key).__name__} with value {key}",
                    status_code=400
                )

            if key == "xText":
                # Extract and validate all parameters using Text class
                params = Text.extract_params(data=data)
                
                value: dict
                
                # Extract parameters for processing
                text = params["text"]
                emb_model = params["emb_model"]
                max_chunk_size = params["max_chunk_size"]
                chunk_overlap = params["chunk_overlap"]
                is_separator_regex = params["is_separator_regex"]
                separators = params["separators"]
                keep_separator = params["keep_separator"]
                index = params["index"]
                
                chunks = chunk(
                    text,
                    max_chunk_size,
                    chunk_overlap,
                    is_separator_regex,
                    separators,
                    keep_separator,
                )
                value["chunks"] = chunks

                # Only process for embedding if index is True
                if index:
                    for doc_id in doc_ids:
                        vector_bases = create_vector_bases(
                            project_id,
                            db_name,
                            doc_id,
                            current_path,
                            chunks,
                            emb_model,
                        )
                        all_vector_bases.extend(vector_bases)

            elif key == "xImage":
                # Extract and validate all parameters using Image class with request files
                params = Image.extract_params(
                    data=data,
                    request_files=request_files, 
                    doc_index=doc_index, 
                    parent_path=parent_path
                )
                
                value: dict
                
                # Extract parameters for processing
                emb_model = params["emb_model"]
                vision_model = params["vision_model"]
                mime_type = params["mime_type"]
                binary_data = params["data"]  # Binary data from multipart files
                max_chunk_size = params["max_chunk_size"]
                chunk_overlap = params["chunk_overlap"]
                is_separator_regex = params["is_separator_regex"]
                separators = params["separators"]
                keep_separator = params["keep_separator"]
                index = params["index"]
                
                # Convert binary data to base64 for existing processing pipeline
                base64_image = Image.binary_to_base64(binary_data)

                # Only process for embedding if index is True
                if index:
                    for doc_id in doc_ids:
                        object_key = generate_object_key(
                            project_id,
                            db_name,
                            collection_name,
                            doc_id,
                            parent_path,
                            mime_type,
                        )
                        emb_image_refs.append(
                            {
                                "object_key": object_key,
                                "base64_image": base64_image,
                                "mime_type": mime_type,
                                "emb_model": emb_model,
                                "vision_model": vision_model,
                                "max_chunk_size": max_chunk_size,
                                "chunk_overlap": chunk_overlap,
                                "is_separator_regex": is_separator_regex,
                                "separators": separators,
                                "keep_separator": keep_separator,
                            }
                        )

            elif isinstance(value, dict):
                result = process_document(
                    data=value,
                    project_id=project_id,
                    db_name=db_name,
                    collection_name=collection_name,
                    doc_ids=doc_ids,
                    parent_path=current_path,
                    request_files=request_files,
                    doc_index=doc_index,
                )
                all_vector_bases.extend(result["all_vector_bases"])
                emb_image_refs.extend(result["emb_image_refs"])
    elif isinstance(data, list):
        for i, item in enumerate(data):
            current_path = f"{parent_path}.{i}"
            result = process_document(
                data=item,
                project_id=project_id,
                db_name=db_name,
                collection_name=collection_name,
                doc_ids=doc_ids,
                parent_path=current_path,
                request_files=request_files,
                doc_index=doc_index,
            )
            all_vector_bases.extend(result["all_vector_bases"])
            emb_image_refs.extend(result["emb_image_refs"])

    return {
        "all_vector_bases": all_vector_bases,
        "emb_image_refs": emb_image_refs,
    }


def chunk(
    text: str,
    max_chunk_size: int,
    chunk_overlap: int,
    is_separator_regex: bool,
    separators: list[str],
    keep_separator: bool,
) -> list[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        # Set a really small chunk size, just to show.
        chunk_size=max_chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=is_separator_regex,
        separators=separators,
        keep_separator=keep_separator,
    )
    texts = text_splitter.split_text(text=text)

    return texts


def process_update(
    operator: str,
    fields: dict,
    project_id: str,
    db_name: str,
    collection_name: str,
    doc_ids: list[str],
    updated_paths: list[str],
    request_files: dict = None,
    doc_index: int = 0,
) -> list:
    if not isinstance(fields, dict):  # Check if fields is not a dictionary
        raise CustomAPIError(
            message=f"Invalid update operation: Expected dictionary for {operator}, but got {type(fields).__name__} instead.",
            status_code=400
        )
    all_vector_bases = []
    emb_image_refs = []
    for path, new_value in fields.items():
        if not isinstance(path, str):
            raise CustomAPIError(
                message=f"Invalid update path: Path must be a string, got {type(path).__name__} with value {path}",
                status_code=400
            )
        updated_paths.append(path)

        # Check the cases (the first two conditions are mostly the same)
        # NOTE: for updating embJSON fields, check operation is one of allowed ones
        path_substrings = path.split(".")
        if path_substrings and path_substrings[-1] == "xText":
            raise CustomAPIError(
                f"Unsupported operation: Updating EmbJSON fields partially is not supported yet. Invalid path: {path}",
                status_code=400
            )
        elif len(path_substrings) > 1 and path_substrings[-2] == "xText":
            raise CustomAPIError(
                f"Unsupported operation: Updating EmbJSON fields partially is not supported yet. Invalid path: {path}",
                status_code=400
            )

        elif "xText" not in path_substrings:
            result = process_document(
                new_value, 
                project_id, 
                db_name, 
                collection_name,
                doc_ids,
                request_files=request_files,
                doc_index=doc_index,
            )
            all_vector_bases.extend(result["all_vector_bases"])
            emb_image_refs.extend(result["emb_image_refs"])

        else:
            raise CustomAPIError(
                f"Invalid path format: {path}. The path contains 'xText' in an unsupported position.",
                status_code=400
            )

    return {
        "all_vector_bases": all_vector_bases,
        "emb_image_refs": emb_image_refs,
    }


def delete_overwritten_pc_vectors(
    doc_ids: list[str],
    updated_paths: list[str],
    project_id: str,
    db_name: str,
):
    # Delete all previous vectors that have the same paths that are being updated in this operation
    delete_id_prefixes: list[str] = []
    for doc_id in doc_ids:
        for path in updated_paths:
            delete_id_prefix = generate_pc_id_prefix(
                project_id,
                db_name,
                doc_id,
                path,
            )
            delete_id_prefixes.append(delete_id_prefix)

    for delete_id_prefix in delete_id_prefixes:
        delete_pc_vectors_by_id_prefix(project_id, db_name, delete_id_prefix)


def delete_overwritten_s3_images(
    doc_ids: list[str],
    updated_paths: list[str],
    project_id: str,
    db_name: str,
    collection_name: str,
):
    # Delete all previous images that have the same paths that are being updated in this operation
    for doc_id in doc_ids:
        for path in updated_paths:
            object_key_prefix = generate_object_key_prefix(
                project_id,
                db_name,
                collection_name,
                doc_id,
                path,
            )
            delete_s3_objects_with_prefix(object_key_prefix)


def create_pc_id_suffixes(path: str, length: int) -> list[str]:
    pc_id_suffixes = []
    path = path.replace(".", "#")
    for i in range(length):
        pc_id_suffix = path + "#" + str(i)
        pc_id_suffixes.append(pc_id_suffix)
    return pc_id_suffixes
