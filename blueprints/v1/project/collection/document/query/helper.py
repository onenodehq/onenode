from bson import ObjectId


def get_chunk_by_path(document: dict, path: str, index: int) -> str | None:
    # Step 1: Split the path by '#'
    path_segments = path.split("#")[1:]

    # Step 2: Traverse the dictionary based on path segments
    current_dict = document
    for segment in path_segments:
        current_dict = current_dict.get(segment, {})

    # Step 3: Check for '@embContent' or '@embText'
    emb_dict = current_dict.get("@embContent") or current_dict.get("@embText")

    # Step 4: Access the 'chunks' list
    chunks_list = emb_dict.get("chunks") if emb_dict else []

    # Step 5: Retrieve the value at the specified index
    if 0 <= index < len(chunks_list):
        result = chunks_list[index]
    else:
        result = None

    return result


def compose_query_data(
    matches: list, sorted_documents: list[dict], include_values: bool
) -> list[dict]:
    data: list[dict] = []
    i, j = 0, 0
    while i < len(matches) and j < len(sorted_documents):
        match = matches[i]
        reference_id = ObjectId(
            match.get("metadata", {}).get("_id", "000000000000000000000000")
        )

        document = sorted_documents[j]
        document_id: ObjectId = document["_id"]

        if reference_id == document_id:
            pc_id: str = match["id"]
            path: str = pc_id.rsplit("#", 1)[0]
            index = int(pc_id.rsplit("#", 1)[1])
            score: float = match["score"]
            values: list[float] = match.get("values", [])
            chunk = get_chunk_by_path(document=document, path=path, index=index)

            if include_values:
                data_item = {
                    "document_id": document_id,
                    "chunk": chunk,
                    "path": path,
                    "index": index,
                    "score": score,
                }
            else:
                data_item = {
                    "document_id": document_id,
                    "chunk": chunk,
                    "path": path,
                    "index": index,
                    "score": score,
                    "values": values,
                }
            data.append(data_item)
            i += 1
        elif reference_id < document_id:
            # this case shouldn't happen
            i += 1
        else:
            j += 1

    return data
