#!/usr/bin/env python
from flask import Flask, request, jsonify

# EB looks for an 'application' callable by default.
application = Flask(__name__)

# add a rule for the index page.
application.add_url_rule('/', 'index', (lambda: "<title>OneNode Brain</title><body>Access the API at /api/v1</body>"))

@application.route('/api/v1/query', methods=['POST'])
def query():
    # Parse JSON from the incoming request
    data = request.json

    # Check if "message" is in the data
    if not data or 'message' not in data:
        return jsonify({'error': 'Missing "message" in request'}), 400

    # Extract the message from the request data
    message = data['message']

    # Create a response dictionary
    response = {
        'message': f"Yes, you like {message.split(' ')[-1]}"
    }

    # Return the response as JSON
    return jsonify(response)

# run the app.
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()
