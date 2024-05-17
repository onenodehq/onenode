from flask import Blueprint, request, Response, stream_with_context
import json
from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import chromadb
import chromadb.errors
from config import get_db_path
from langchain_openai import OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from auth.auth import jwt_required
from langchain.chains import create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_query = Blueprint("query", __name__, url_prefix="/v1/query")


@v1_blueprint_query.route("/", methods=["POST"])
@jwt_required  # JWT token required for authorization
def generate_response():
    # Function to generate the response stream
    def generate():
        try:
            # Parse JSON data from the request body
            data = request.get_json()
            query = data.get("query")
            question = query
            is_public = data.get("is_public")
            chat_history = data.get("chat_history", [])

            # Check if required fields are present
            if not (query and is_public):
                # Yield error message if required fields are missing
                yield json.dumps(
                    {
                        "message": "Missing one or more required fields: 'query', 'is_public', 'chat_history'."
                    }
                ) + "\n"
                return

            # Initialize ChromaDB client with persistent storage
            db_path = get_db_path()
            client = chromadb.PersistentClient(path=db_path)

            # Create an embedding function using OpenAI embeddings
            openai_ef = OpenAIEmbeddings(model="text-embedding-ada-002")

            # Initialize Chroma vector store
            vectorstore = Chroma(
                client=client,
                collection_name="content_collection",
                embedding_function=openai_ef,
            )

            # Set up the retriever for the vector store
            retriever = vectorstore.as_retriever()

            # Initialize OpenAI Chat model
            llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

            contextualize_q_system_prompt = """Given a chat history and the latest user question \
            which might reference context in the chat history, formulate a standalone question \
            which can be understood without the chat history. Do NOT answer the question, \
            just reformulate it if needed and otherwise return it as is."""
            contextualize_q_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", contextualize_q_system_prompt),
                    MessagesPlaceholder("chat_history"),
                    ("human", "{input}"),
                ]
            )
            history_aware_retriever = create_history_aware_retriever(
                llm, retriever, contextualize_q_prompt
            )

            qa_system_prompt = """You are an assistant for question-answering tasks. \
            Use the following pieces of retrieved context to answer the question. \
            If you don't know the answer, just say that you don't know. \
            Use three sentences maximum and keep the answer concise.\

            {context}"""
            qa_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", qa_system_prompt),
                    MessagesPlaceholder("chat_history"),
                    ("human", "{input}"),
                ]
            )

            question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
            rag_chain = create_retrieval_chain(
                history_aware_retriever, question_answer_chain
            )

            # Stream the responses from the RAG chain
            for jsonpatch_op in rag_chain.stream(
                {"input": question, "chat_history": chat_history},
            ):
                yield json.dumps(jsonpatch_op.get("answer")) + "\n"

        except Exception as e:
            print("catch error:", e)
            # Yield error message if an exception occurs
            yield json.dumps({"error": str(e)}) + "\n"

    # Return a streamed response with the generated conten
    return Response(stream_with_context(generate()), mimetype="application/json")
