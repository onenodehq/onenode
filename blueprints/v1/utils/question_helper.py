from typeguard import typechecked


@typechecked
def docs_to_context(docs: list[dict]) -> str:
    formatted = []
    for doc in docs:
        # Ensure that 'metadata' and 'id', 'text' keys exist
        doc_id = doc.get("id")
        doc_text = doc.get("text")

        if doc_id is None or doc_text is None:
            continue  # Skip documents that do not meet the required structure

        formatted.append(f"Source ID: {doc_id}, Source Snippet: {doc_text}")
    return "\n\n" + "\n\n".join(formatted)