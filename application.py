from flask import Flask
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask application configuration
application = Flask(__name__)

# Home route
@application.route("/")
def home():
    return "Hello World!"


# Only for development environment
if __name__ == "__main__":
    application.run()