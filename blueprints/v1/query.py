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

v1_blueprint_query = Blueprint("query", __name__, url_prefix="/v1/query")


@v1_blueprint_query.route("/", methods=["POST"])  # Adjust '/your_endpoint' as needed
@jwt_required
def test():
    def generate():
        try:
            data = request.get_json()  # Get JSON data from request body
            query = data.get("query")
            is_public = data.get("is_public")
            chat_history = data.get("chat_history", [])

            if not (query and is_public):
                yield json.dumps(
                    {
                        "message": "Missing one or more required fields: 'query', 'is_public', 'chat_history'."
                    }
                ) + "\n"
                return

            db_path = get_db_path()
            client = chromadb.PersistentClient(path=db_path)
            openai_ef = OpenAIEmbeddings(model="text-embedding-ada-002")
            vectorstore = Chroma(
                client=client,
                collection_name="collection_name",
                embedding_function=openai_ef,
            )
            retriever = vectorstore.as_retriever()
            llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

            contextualize_q_system_prompt = """Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."""
            contextualize_q_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", contextualize_q_system_prompt),
                    MessagesPlaceholder(variable_name="chat_history"),
                    ("human", "{question}"),
                ]
            )
            contextualize_q_chain = (
                contextualize_q_prompt | llm | StrOutputParser()
            ).with_config(tags=["contextualize_q_chain"])

            qa_system_prompt = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise."""
            qa_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", qa_system_prompt),
                    MessagesPlaceholder(variable_name="chat_history"),
                    ("human", "{question}"),
                ]
            )

            rag_chain = (
                RunnablePassthrough.assign(context=contextualize_q_chain | retriever)
                | qa_prompt
                | llm
            )

            question = query

            for jsonpatch_op in rag_chain.stream(
                {"question": question, "chat_history": chat_history},
            ):
                yield json.dumps(jsonpatch_op.content) + "\n"

        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return Response(stream_with_context(generate()), mimetype="application/json")
