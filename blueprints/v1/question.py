from hmac import new
from http import client
from typing import List, Set
from chromadb import GetResult
from flask import Blueprint, cli, request, Response, stream_with_context
import json
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from typeguard import typechecked
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from auth.auth import jwt_required
from langchain.chains import create_history_aware_retriever
from langchain_core.documents.base import Document
from blueprints.v1.utils.chroma_setup import (
    vectorstore,
    collection,
)  # Import the initialized components


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

            qa_system_prompt = """You are a large language AI assistant built by OneNode. You are given a user question, and please write clean, concise and accurate answer to the question. You will be given a set of related/unrelated contexts to the question, each starting with a reference number like [xxxx], where x is a number. Please use the context and cite the context at the end of each sentence if applicable.
            Your answer must be correct, accurate and written by an expert using an unbiased and professional tone. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information. Do not give information that doesn't appear in any given context.
            Please cite the contexts with the reference IDs, in the format [xxxx]. If a sentence comes from multiple contexts, please list all applicable citations, like [b77bad72-e639-4cb6-9a74-c3aa42c2902e][3fa85f64-5717-4562-b3fc-2c963f66afa6]. Other than code and specific names and citations, your answer must be written in the same language as the question.
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
                context=history_aware_retriever | add_linked_docs | format_docs_with_id | RunnablePassthrough(print)
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


@typechecked
def format_docs_with_id(docs: List[Document]) -> str:
    formatted = [
        f"Source ID: {doc.metadata['group_id']}, Source Snippet: {doc.page_content}"
        for i, doc in enumerate(docs)
    ]
    return "\n\n" + "\n\n".join(formatted)


@typechecked
def add_linked_docs(docs: List[Document]) -> List[Document]:
    new_docs: List[Document] = []
    processed_group_ids = set()

    for doc in docs:
        group_id = doc.metadata.get("group_id")

        if group_id not in processed_group_ids:
            processed_group_ids.add(group_id)
            items = collection.get(where={"group_id": group_id})
            documents = items["documents"]
            metadatas = items["metadatas"]
            print("number of items: ", len(documents))

            new_doc = Document(metadata={"group_id": group_id}, page_content="")
            new_docs.append(new_doc)

            for document in documents:
                new_docs[-1].page_content += "'" + document.strip() + "', "

    return new_docs
