import logging
import os
from dotenv import load_dotenv

from errors import AuthError, PathNotFoundError

# Load environment variables
load_dotenv()

from flask import jsonify
from langchain_openai import ChatOpenAI
from blueprints.private.routes import private_v1_blueprint
from blueprints.v1.routes import v1_blueprint_root
from blueprints.v0.routes import v0_blueprint_root
from flask_cors import CORS
from create_app import application

llm = ChatOpenAI()

CORS(application)

# Register the Blueprint
application.register_blueprint(private_v1_blueprint)
application.register_blueprint(v1_blueprint_root)
application.register_blueprint(v0_blueprint_root)


# Get log level from environment variable or default to 'WARNING'
log_level = os.getenv("LOG_LEVEL", "WARNING").upper()
numeric_level = getattr(logging, log_level, None)
# Configure logging
logging.basicConfig(
    level=numeric_level, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@application.errorhandler(AuthError)
def handle_auth_error(ex):
    logger.error(
        f"Authentication error: {ex.error}, Status code: {ex.status_code}",
        exc_info=True,
    )
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


@application.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"An unexpected error occurred: {e}", exc_info=True)
    response = {"error": "An unexpected error occurred", "details": str(e)}
    return jsonify(response), 500


@application.errorhandler(PathNotFoundError)
def handle_path_not_found_error(error):
    response = jsonify({"error": error.message})
    response.status_code = 400  # Bad Request
    return response


# Home route
@application.route("/")
def home():
    return f"Welcome to OneNode API!"


# Only for development environment
if __name__ == "__main__":
    application.run()
