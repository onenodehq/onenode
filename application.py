from flask import Flask, jsonify
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from blueprints.v1.view import v1
from blueprints.v1.add import v1_blueprint_add
from blueprints.v1.query import v1_blueprint_query
from blueprints.test.view import test_blueprint_query

# Load environment variables
load_dotenv()

llm = ChatOpenAI()

# Flask application configuration
application = Flask(__name__)

# Register the Blueprint
application.register_blueprint(v1)
application.register_blueprint(v1_blueprint_add)
application.register_blueprint(test_blueprint_query)
application.register_blueprint(v1_blueprint_query)


# Home route
@application.route("/")
def home():
    res = llm.invoke("How to cook eggs?")
    return jsonify({"response": res.content})


# Only for development environment
if __name__ == "__main__":
    application.run()
