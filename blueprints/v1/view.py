from flask import request, jsonify, current_app, Blueprint

v1 = Blueprint('v1', __name__, url_prefix='/v1')

@v1.route("/query", methods=["GET"])
def query_index():
    query_text = request.args.get("text", None)
    if query_text is None:
        return (
            "No text found, please include a ?text=blah parameter in the URL",
            200,
        )
    query_engine = current_app.config["INDEX"].as_query_engine()
    response = query_engine.query(query_text)
    return str(response), 200