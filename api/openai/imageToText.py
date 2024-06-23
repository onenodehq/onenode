import base64
import os
import aiohttp
import asyncio

# OpenAI API Key
api_key = os.environ.get("OPENAI_API_KEY")

headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}


async def imageToText(base64_image):
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Give a comprehensive description about this image.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
        "max_tokens": 300,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
        ) as response:
            response_json = await response.json()
            print(response_json)
            return response_json