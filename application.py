import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from flask import jsonify
from langchain_openai import ChatOpenAI
from blueprints.private.v1.question import private_v1_blueprint_question
from blueprints.private.v1.resource import private_v1_blueprint_resource
from blueprints.private.v1.api_key import private_v1_blueprint_api_key
from blueprints.private.v1.onenode_id import private_v1_blueprint_onenode_id
from blueprints.private.v1.org import private_v1_blueprint_org
from flask_cors import CORS
from create_app import AuthError, application


llm = ChatOpenAI()

CORS(application)

# Register the Blueprint
application.register_blueprint(private_v1_blueprint_question)
application.register_blueprint(private_v1_blueprint_resource)
application.register_blueprint(private_v1_blueprint_api_key)
application.register_blueprint(private_v1_blueprint_onenode_id)
application.register_blueprint(private_v1_blueprint_org)

# Get log level from environment variable or default to 'WARNING'
log_level = os.getenv("LOG_LEVEL", "WARNING").upper()
numeric_level = getattr(logging, log_level, None)
# Configure logging
logging.basicConfig(
    level=numeric_level, format="%(asctime)s - %(levelname)s - %(message)s"
)

@application.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

@application.errorhandler(Exception)
def handle_exception(e):
    response = {
        "error": "An unexpected error occurred",
        "details": str(e)
    }
    return jsonify(response), 500

# Home route
@application.route("/")
def home():
    return f"Welcome to OneNode API!"


# Only for development environment
if __name__ == "__main__":
    application.run()
