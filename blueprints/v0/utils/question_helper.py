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

        formatted.append(f"Information ID: {doc_id}, Information: {doc_text}")
    return "\n\n" + "\n\n".join(formatted)


def format_to_openai_messages(dict_list: list[dict]):
    """
    Formats a list of dictionaries into OpenAI's API message format.

    Args:
        dict_list (list): A list of dictionaries to be formatted.

    Returns:
        list: A list of dictionaries formatted for OpenAI's API.
    """
    return [
        {"role": item.get("role", ""), "content": item.get("content", "")}
        for item in dict_list
    ]
