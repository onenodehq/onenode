import chromadb
from flask import Flask, jsonify
from dotenv import load_dotenv
from config import get_db_path
from migrations.db_version_manager import check_and_migrate_db, read_db_version

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from blueprints.v1.view import v1
from blueprints.v1.question import v1_blueprint_question
from blueprints.v1.resource import v1_blueprint_resource
from blueprints.test.view import test_blueprint_query
from flask_cors import CORS


llm = ChatOpenAI()

# Flask application configuration
application = Flask(__name__)
CORS(application)

# Register the Blueprint
application.register_blueprint(v1)
application.register_blueprint(test_blueprint_query)
application.register_blueprint(v1_blueprint_question)
application.register_blueprint(v1_blueprint_resource)

check_and_migrate_db()


# Home route
@application.route("/")
def home():
    current_version = read_db_version()
    return f"Hello, World!\nVersion: {current_version}"


# Only for development environment
if __name__ == "__main__":
    application.run()
