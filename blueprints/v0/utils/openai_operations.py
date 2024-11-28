from openai import Stream
from blueprints.v0.utils.openai_setup import openai_client
from openai.types.chat.chat_completion_chunk import ChatCompletionChunk


def image_to_text(
    base64_image: str, mime_type: str, model: str = "gpt-4o-mini", max_tokens: int = 300
) -> str:
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What’s in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{base64_image}",
                    },
                },
            ],
        }
    ]

    response = openai_client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content


""" response = {
    'id': 'chatcmpl-9eFt4JjhosRB7UvpARb946lgQc8me',
    'choices': [
        {
            'finish_reason': 'stop',
            'index': 0,
            'logprobs': None,
            'message': {
                'content': 'The image shows a table setup that includes several wine glasses, each filled partially with red wine. The glasses are arranged neatly and some are placed on coasters that have the text "Opus One" printed on them. There are also a couple of white napkins on the table with the same text "Opus One." Additionally, there is a single glass of water present among the wine glasses. The setting appears to be arranged for a wine tasting or a similar event.',
                'role': 'assistant',
                'function_call': None,
                'tool_calls': None
            }
        }
    ],
    'created': 1719381218,
    'model': 'gpt-4o-2024-05-13',
    'object': 'chat.completion',
    'system_fingerprint': 'fp_4008e3b719',
    'usage': {
        'completion_tokens': 95,
        'prompt_tokens': 778,
        'total_tokens': 873
    }
} """


def contextualize_question(question: str, chat_history: list[dict[str, str]]):
    system_prompt = """Given a chat history and the latest user question \
        which might reference context in the chat history, formulate a standalone question \
        which can be understood without the chat history. Do NOT answer the question, \
        just reformulate it if needed and otherwise return it as is."""

    openai_client

    completion = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            *chat_history,
            {"role": "user", "content": question},
        ],
    )

    result = completion.choices[0].message.content
    return result

def get_contextual_response(question: str, chat_history: list[dict[str, str]], context):
    system_prompt = f"""You are a large language AI assistant built by OneNode. You are given a user question, and please write clean, concise and accurate answer to the question. You will be given a set of related/unrelated contexts to the question, each starting with a reference number like [xxxx], where x is a number. Please use the context and cite the context at the end of each sentence if applicable.
        Your answer must be correct, accurate and written by an expert using an unbiased and professional tone. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information. Do not give information that doesn't appear in any given context.
        Please cite the contexts with the reference IDs, in the format ((xxxx)). If a sentence comes from multiple contexts, please list all applicable citations, like ((b77bad72-e639-4cb6-9a74-c3aa42c2902e))((3fa85f64-5717-4562-b3fc-2c963f66afa6)).
        Use markdown language as output. Here are the set of contexts:

        {context}
        
        Remember, don't blindly repeat the contexts verbatim."""

    stream: Stream[ChatCompletionChunk] = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            *chat_history,
        ],
        stream=True,
        temperature=0,
    )

    try:
        for message in stream:
            chunk_content = message.choices[0].delta.content
            if chunk_content:
                yield chunk_content
            if (
                "finish_reason" in message.choices[0]
                and message["choices"][0]["finish_reason"] == "stop"
            ):
                break
    except Exception as e:
        raise e


def embed_text(text: str, model: str = "text-embedding-3-small") -> list:
    response = openai_client.embeddings.create(input=text, model=model)
    embedding = response.data[0].embedding
    return embedding
