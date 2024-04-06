from flask import request, jsonify, current_app, Blueprint

v1 = Blueprint('v1', __name__, url_prefix='/v1')

@v1.route("/test", methods=["GET"])
def test():
    return jsonify({"status": "success", "message": "Test endpoint reached"}), 200
