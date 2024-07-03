from openai import OpenAI

from typeguard import typechecked


@typechecked
def image_to_text(image_url: str) -> str:
    """
    Analyze a list of image URLs and return the OpenAI API response.

    Args:
        image_urls (List[str]): A list of image URLs to be analyzed.

    Returns:
        Dict: The response from the OpenAI API.
    """
    client = OpenAI()
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What’s in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_url,
                        "detail": "high",
                    },
                },
            ],
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=300,
    )

    print(response)

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


@typechecked
def contextualize_question(question: str, chat_history: list[dict[str, str]]):
    system_prompt = """Given a chat history and the latest user question \
        which might reference context in the chat history, formulate a standalone question \
        which can be understood without the chat history. Do NOT answer the question, \
        just reformulate it if needed and otherwise return it as is."""

    client = OpenAI()

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            *chat_history,
            {"role": "user", "content": question},
        ],
    )

    result = completion.choices[0].message.content
    return result

