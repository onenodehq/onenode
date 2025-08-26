import os, time
from pinecone import Pinecone, ServerlessSpec

# Hardcoded index names - no longer configurable via environment variables
PINECONE_INDEX_1536 = "onenode-embeddings-1536"
PINECONE_INDEX_3072 = "onenode-embeddings-3072"

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

if PINECONE_INDEX_1536 not in existing_indexes:
    pc.create_index(
        name=PINECONE_INDEX_1536,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    while not pc.describe_index(PINECONE_INDEX_1536).status["ready"]:
        time.sleep(1)

if PINECONE_INDEX_3072 not in existing_indexes:
    pc.create_index(
        name=PINECONE_INDEX_3072,
        dimension=3072,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    while not pc.describe_index(PINECONE_INDEX_3072).status["ready"]:
        time.sleep(1)

pc_index_1536 = pc.Index(PINECONE_INDEX_1536)
pc_index_3072 = pc.Index(PINECONE_INDEX_3072)