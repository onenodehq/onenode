from blueprints.v0.utils.openai_setup import openai_client


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

def embed_text(text: str, model: str = "text-embedding-3-small") -> list:
    response = openai_client.embeddings.create(input=text, model=model)
    embedding = response.data[0].embedding
    return embedding
