from flask import request, jsonify
from flask import Blueprint

test = Blueprint('test', __name__, url_prefix='/test')


@test.route('/', methods=['POST'])
def post():
    data = request.get_json()

    response = {
        'message': 'Data received successfully',
        'data': data
    }
    return jsonify(response), 200