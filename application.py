import logging
import os
from dotenv import load_dotenv
from migrations.db_version_manager import check_and_migrate_db, read_db_version

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from blueprints.v1.question import v1_blueprint_question
from blueprints.v1.resource import v1_blueprint_resource
from flask_cors import CORS
from create_app import application


llm = ChatOpenAI()

CORS(application)

# Register the Blueprint
application.register_blueprint(v1_blueprint_question)
application.register_blueprint(v1_blueprint_resource)

check_and_migrate_db()

# Get log level from environment variable or default to 'WARNING'
log_level = os.getenv("LOG_LEVEL", "WARNING").upper()
numeric_level = getattr(logging, log_level, None)
# Configure logging
logging.basicConfig(
    level=numeric_level, format="%(asctime)s - %(levelname)s - %(message)s"
)


# Home route
@application.route("/")
def home():
    current_version = read_db_version()
    return f"Hello, World!"


# Only for development environment
if __name__ == "__main__":
    application.run()
