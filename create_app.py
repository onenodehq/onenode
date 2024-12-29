# Flask application configuration
# To avoid circular imports
from flask import Flask


def create_app():
    application = Flask(__name__)

    return application


application = create_app()
