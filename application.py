from flask import Flask, jsonify
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from blueprints.v1.view import v1

# Load environment variables
load_dotenv()

llm = ChatOpenAI()

# Flask application configuration
application = Flask(__name__)

# Register the Blueprint
application.register_blueprint(v1, url_prefix='/v1')

# Home route
@application.route("/")
def home():
    res = llm.invoke("How to cook eggs?")
    return jsonify({"response": res.content})


# Only for development environment
if __name__ == "__main__":
    application.run()