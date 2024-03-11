#!/usr/bin/env python
from flask import Flask, request, jsonify
import os
from llama_index.core import (
        SimpleDirectoryReader,
        VectorStoreIndex,
        StorageContext,
        load_index_from_storage,
)
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

index = None

def initialize_index():
    global index
    storage_context = StorageContext.from_defaults()
    if os.path.exists("./storage"):
        index = load_index_from_storage(storage_context)
    else:
        print("[START] Creating Vector Database")
        starttime = datetime.now()
        documents = SimpleDirectoryReader("./documents").load_data()
        index = VectorStoreIndex.from_documents(
                documents, storage_context=storage_context
        )
        storage_context.persist()
        endtime = datetime.now()
        diff_ms = (endtime - starttime).total_seconds() * 1000
        print(f"[END] Done creating Vector Database, it took {diff_ms} ms")

# EB looks for an 'app' callable by default.
app = Flask(__name__)

# add a rule for the index page.
app.add_url_rule('/', 'index', (lambda: "<title>OneNode Brain</title><body>Access the API at /api/v1</body>"))

@app.route('/api/v1/query', methods=['POST'])
def query():
    # Parse JSON from the incoming request
    data = request.json

    # Check if "message" is in the data
    if not data or 'message' not in data:
        return jsonify({'error': 'Missing "message" in request'}), 400

    # Extract the message from the request data
    message = data['message']

    # Create a response dictionary
    response = {
        'message': f"Yes, you like {message.split(' ')[-1]}"
    }

    # Return the response as JSON
    return jsonify(response)


@app.route("/api/v1/example", methods=["GET"])
def query_index():
    global index
    query_text = request.args.get("text", None)
    if query_text is None:
        return (
            "No text found, please include a ?text=blah parameter in the URL",
            400,
        )
    query_engine = index.as_query_engine()
    response = query_engine.query(query_text)
    return str(response), 200

# run the app.
if __name__ == "__main__":
    if os.environ.get("FLASK_RUN_FROM_RELOADER") == "true":
        initialize_index()
    else:
        os.environ["FLASK_RUN_FROM_RELOADER"] = "true"
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    app.debug = True
    app.run()
