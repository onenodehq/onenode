from flask import Flask, jsonify
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()

llm = ChatOpenAI()

# Flask application configuration
application = Flask(__name__)

# Home route
@application.route("/")
def home():
    res = llm.invoke("how can langsmith help with testing?")
    return jsonify({"response": res.content})


# Only for development environment
if __name__ == "__main__":
    application.run()