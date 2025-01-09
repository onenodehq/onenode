import os, time
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import Pinecone as LangchainPinecone
from pinecone import Pinecone, ServerlessSpec

PINECONE_ADMIN_INDEX = os.getenv("PINECONE_ADMIN_INDEX")
PINECONE_INDEX_1536 = os.getenv("PINECONE_INDEX_1536")
PINECONE_INDEX_3072 = os.getenv("PINECONE_INDEX_3072")
PC_FREE_STORAGE_LIMIT_MB = int(os.getenv("PC_FREE_STORAGE_LIMIT_MB"))

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

if PINECONE_INDEX_1536 not in existing_indexes:
    pc.create_index(
        name=PINECONE_INDEX_1536,
        dimension=DIMENSIONS,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    while not pc.describe_index(PINECONE_INDEX_1536).status["ready"]:
        time.sleep(1)

pc_admin_index = pc.Index(PINECONE_ADMIN_INDEX)
pc_index_1536 = pc.Index(PINECONE_INDEX_1536)
pc_index_3072 = pc.Index(PINECONE_INDEX_3072)

vectorstore = LangchainPinecone(index_name=PINECONE_ADMIN_INDEX, embedding=openai_ef)
