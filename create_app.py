# Flask application configuration
# To avoid circular imports
from flask import Flask

application = Flask(__name__)

# Error handler
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code