import os, time
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

PINECONE_ADMIN_INDEX = os.getenv("PINECONE_ADMIN_INDEX")
PINECONE_CLIENT_INDEX = os.getenv("PINECONE_CLIENT_INDEX")

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

openai_ef = OpenAIEmbeddings(model="text-embedding-ada-002")
DIMENSIONS = len(openai_ef.embed_query(""))

if PINECONE_ADMIN_INDEX not in existing_indexes:
    pc.create_index(
        name=PINECONE_ADMIN_INDEX,
        dimension=DIMENSIONS,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    while not pc.describe_index(PINECONE_ADMIN_INDEX).status["ready"]:
        time.sleep(1)

if PINECONE_CLIENT_INDEX not in existing_indexes:
    pc.create_index(
        name=PINECONE_CLIENT_INDEX,
        dimension=DIMENSIONS,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    while not pc.describe_index(PINECONE_CLIENT_INDEX).status["ready"]:
        time.sleep(1)

pc_admin_index = pc.Index(PINECONE_ADMIN_INDEX)
pc_client_index = pc.Index(PINECONE_CLIENT_INDEX)

vectorstore = PineconeVectorStore(index_name=PINECONE_ADMIN_INDEX, embedding=openai_ef)
