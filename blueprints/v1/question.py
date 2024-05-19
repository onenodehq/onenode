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

# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_question = Blueprint("question", __name__, url_prefix="/v1/question")


@v1_blueprint_question.route("/", methods=["POST"])
@jwt_required  # JWT token required for authorization
def generate_response():
    # Function to generate the response stream
    def generate():
        try:
            # Parse JSON data from the request body
            data = request.get_json()
            question = data.get("question")
            is_public = data.get("is_public")
            chat_history = data.get("chat_history", [])

            # Check if required fields are present
            if not (question and is_public):
                # Yield error message if required fields are missing
                yield json.dumps(
                    {
                        "message": "Missing one or more required fields: 'question', 'is_public', 'chat_history'."
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

            qa_system_prompt = """You are a large language AI assistant built by OneNode. You are given a user question, and please write clean, concise and accurate answer to the question. You will be given a set of related/unrelated contexts to the question, each starting with a reference number like [citation:x], where x is a number. Please use the context and cite the context at the end of each sentence if applicable.
            Your answer must be correct, accurate and written by an expert using an unbiased and professional tone. Please limit to 1024 tokens. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information. Do not give information that doesn't appear in any given context.
            Please cite the contexts with the reference numbers, in the format [citation:x]. If a sentence comes from multiple contexts, please list all applicable citations, like [citation:3][citation:5]. Other than code and specific names and citations, your answer must be written in the same language as the question.
            Here are the set of contexts:

            {context}
            
            Remember, don't blindly repeat the contexts verbatim. And here is the user question:"""
            qa_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", qa_system_prompt),
                    MessagesPlaceholder("chat_history"),
                    ("human", "{input}"),
                ]
            )
            question_answer_chain = qa_prompt | llm | StrOutputParser()

            rag_chain = RunnablePassthrough.assign(
                context=history_aware_retriever | format_docs_with_id
            ) | RunnablePassthrough.assign(answer=question_answer_chain)

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


def format_docs_with_id(docs) -> str:
    formatted = [
        f"Source ID: {i}, Source Snippet: {doc.page_content}"
        for i, doc in enumerate(docs)
    ]
    return "\n\n" + "\n\n".join(formatted)
