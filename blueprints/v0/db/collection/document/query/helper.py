from errors import CustomAPIError


def get_chunk_by_path(doc: dict, path: str, chunk_n: int) -> str | None:
    # Step 1: Split the path by '#'
    path_segments = path.split("#")

    # Step 2: Traverse the dictionary based on path segments
    current_dict = doc
    for segment in path_segments:
        current_dict = current_dict.get(segment, {})

    # Step 3: Check for 'xImage' or 'xText'
    emb_dict = current_dict.get("xImage") or current_dict.get("xText")

    # Step 4: Access the 'chunks' list
    chunks_list = emb_dict.get("chunks") if emb_dict else []

    # Step 5: Retrieve the value at the specified chunk_n
    if 0 <= chunk_n < len(chunks_list):
        result = chunks_list[chunk_n]
    else:
        result = None

    return result


def compose_query_response(
    matches: list, doc_lookup: dict, include_values: bool
) -> list[dict]:
    data = []

    for match in matches:
        pc_id = match["id"]
        _, _, _, doc_id, path, chunk_n_str = pc_id.split("#")
        chunk_n = int(chunk_n_str)
        score = match["score"]
        values = match.get("values", [])

        doc = doc_lookup.get(doc_id)
        if doc:  # Sync Failure Logic
            chunk = get_chunk_by_path(doc, path, chunk_n)

            # Construct the response item with conditional inclusion of "values"
            data_item = {
                "chunk": chunk,
                "path": path,
                "chunk_n": chunk_n,
                "score": score,
                **({"values": values} if include_values else {}),
                "document": doc,
            }
            data.append(data_item)

    return data


def convert_projection(projection: dict | None) -> dict | None:
    if projection is None:
        return None

    if not isinstance(projection, dict):
        raise CustomAPIError(
            "Invalid projection format: Projection must be a dictionary.",
            status_code=400
        )

    # Allowed keys in 'projection'
    allowed_keys = {"mode", "fields"}
    provided_keys = set(projection.keys())

    # Check for invalid keys
    invalid_keys = provided_keys - allowed_keys
    if invalid_keys:
        raise CustomAPIError(
            f"Invalid projection configuration: Unrecognized keys in projection: {', '.join(invalid_keys)}. Allowed keys are: {', '.join(allowed_keys)}",
            status_code=400
        )

    # 'mode' is required and must be 'include' or 'exclude'
    mode = projection.get("mode")
    if mode not in {"include", "exclude"}:
        raise CustomAPIError(
            f"Invalid projection mode: '{mode}'. Mode must be either 'include' or 'exclude'.",
            status_code=400
        )

    # 'fields' is optional
    fields = projection.get("fields")

    # If 'fields' is provided, it must be a list of strings
    if fields is not None:
        if not isinstance(fields, list):
            raise CustomAPIError(
                f"Invalid fields format: 'fields' must be a list of field names, got {type(fields).__name__}.",
                status_code=400
            )
        if not all(isinstance(field, str) for field in fields):
            non_string_fields = [f"{field} ({type(field).__name__})" for field in fields if not isinstance(field, str)]
            raise CustomAPIError(
                f"Invalid field names: All field names must be strings. Found non-string values: {', '.join(non_string_fields)}",
                status_code=400
            )

    # Build the MongoDB projection
    if mode == "include":
        if fields:
            # Include only the specified fields
            mongo_projection = {field: 1 for field in fields}
        else:
            # Include all fields (None projection)
            mongo_projection = None
    else:  # mode == 'exclude'
        if fields:
            # Exclude the specified fields
            mongo_projection = {field: 0 for field in fields}
        else:
            # Exclude all fields except '_id'
            mongo_projection = {"_id": 1}

    return mongo_projection
