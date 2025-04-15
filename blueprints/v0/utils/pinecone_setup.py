import os, time
from pinecone import Pinecone, ServerlessSpec

PINECONE_INDEX_1536 = os.getenv("PINECONE_INDEX_1536", "capydb_1536")
PINECONE_INDEX_3072 = os.getenv("PINECONE_INDEX_3072", "capydb_3072")
PC_FREE_STORAGE_LIMIT_MB = int(os.getenv("PC_FREE_STORAGE_LIMIT_MB"))

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

pc_index_1536 = pc.Index(PINECONE_INDEX_1536)
pc_index_3072 = pc.Index(PINECONE_INDEX_3072)