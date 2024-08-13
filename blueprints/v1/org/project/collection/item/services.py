from errors import PathNotFoundError
from langchain_text_splitters import RecursiveCharacterTextSplitter
from blueprints.v1.utils.openai_setup import openai_client


def process_targets(document: dict) -> dict:
    targets: list = document.get("_targets")
    for target in targets:
        process_field(document, target)


def process_field(document: dict, field_path) -> dict:
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
        
        return document
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


def embed_texts(texts: list[str]) -> list[str]:
    embeddings = []
    for text in texts:
        response = openai_client.embeddings.create(
            input=text, model="text-embedding-ada-002"
        )
        embeddings.append(response["data"][0]["embedding"])
    return embeddings
