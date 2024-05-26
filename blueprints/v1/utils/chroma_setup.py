import os
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from config import get_db_path

# Initialize ChromaDB client with persistent storage
db_path = get_db_path()
client = chromadb.PersistentClient(path=db_path)

# Create an embedding function using OpenAI embeddings
openai_ef = OpenAIEmbeddings(model="text-embedding-ada-002")
openai_ef_ = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENAI_API_KEY"), model_name="text-embedding-ada-002"
)

# Initialize Chroma vector store
vectorstore = Chroma(
    client=client,
    collection_name="resource_collection",
    embedding_function=openai_ef,
)