# Import external libraries
import os
from flask import Flask, request
from dotenv import load_dotenv
from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
    load_index_from_storage,
)
from blueprints.test.view import test
from blueprints.v1.view import v1

# Load environment variables
load_dotenv()

# Flask application configuration
application = Flask(__name__)

# Register the Blueprint
application.register_blueprint(test)
application.register_blueprint(v1)

# Home route
@application.route("/")
def home():
    return "Hello World!"

def initialize_index():
    storage_context = StorageContext.from_defaults(persist_dir=index_dir)
    if os.path.exists(index_dir):
        application.config["INDEX"] = load_index_from_storage(storage_context)
    else:
        documents = SimpleDirectoryReader("./documents").load_data()
        application.config["INDEX"] = VectorStoreIndex.from_documents(
            documents, storage_context=storage_context
        )
        storage_context.persist(index_dir)

        # Query route
@application.route("/query", methods=["GET"])
def query_index():
    if application.config["INDEX"] is None:
        # This should not happen after moving initialize_index, but added as a precaution
        return "Index not initialized", 500
    query_text = request.args.get("text", None)
    if query_text is None:
        return (
            "No text found, please include a ?text=blah parameter in the URL",
            400,
        )
    query_engine = application.config["INDEX"].as_query_engine()
    response = query_engine.query(query_text)
    return str(response), 200

# Index initialization
application.config["INDEX"] = None
index_dir = os.path.join(os.path.dirname(__file__), "index")

initialize_index()

# Only for development environment
if __name__ == "__main__":
    initialize_index()
    application.run()