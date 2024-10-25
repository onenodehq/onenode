from bson import ObjectId


def get_chunk_by_path(doc: dict, path: str, chunk_n: int) -> str | None:
    # Step 1: Split the path by '#'
    path_segments = path.split("#")

    # Step 2: Traverse the dictionary based on path segments
    current_dict = doc
    for segment in path_segments:
        current_dict = current_dict.get(segment, {})

    # Step 3: Check for '@embContent' or '@embText'
    emb_dict = current_dict.get("@embContent") or current_dict.get("@embText")

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
    data: list[dict] = []
    for match in matches:
        pc_id: str = match["id"]
        substrings = pc_id.split("#")
        doc_id: str = substrings[3]
        path: str = substrings[4]
        chunk_n = int(substrings[5])
        score: float = match["score"]
        values: list[float] = match.get("values", [])
        doc = doc_lookup.get(doc_id)

        chunk = get_chunk_by_path(
            doc,
            path,
            chunk_n,
        )

        if include_values:
            data_item = {
                "document_id": doc_id,
                "path": path,
                "chunk": chunk,
                "chunk_n": chunk_n,
                "score": score,
                "values": values,
            }
        else:
            data_item = {
                "document_id": doc_id,
                "path": path,
                "chunk": chunk,
                "chunk_n": chunk_n,
                "score": score,
            }
        data.append(data_item)

    return data
