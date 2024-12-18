import logging
import os
from dotenv import load_dotenv

from errors import AuthError, CustomAPIError

# Load environment variables
load_dotenv()

from flask import jsonify
from blueprints.private.routes import private_blueprint
from blueprints.v0.routes import v0_blueprint_root
from flask_cors import CORS
from create_app import application

CORS(application)

# Register the Blueprint
application.register_blueprint(private_blueprint)
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
        f"AuthError: {ex.message}",
        exc_info=True,
    )
    response = {
        "status": "error",
        "code": ex.status_code,
        "message": ex.message,
    }
    return jsonify(response), ex.status_code


@application.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"AuthError: {e}", exc_info=True)
    response = {
        "status": "error",
        "code": 500,
        "message": "An unexpected error occurred.",
    }
    return jsonify(response), 500


@application.errorhandler(CustomAPIError)
def handle_path_not_found_error(e):
    response = {
        "status": "error",
        "code": e.status_code,
        "message": e.message,
    }
    return jsonify(response), e.status_code


# Home route
@application.route("/")
def home():
    return f"Welcome to CapybaraDB API!"


# Only for development environment
if __name__ == "__main__":
    application.run()
