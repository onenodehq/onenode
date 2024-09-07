from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
import logging

from auth.auth_decorator import requires_auth
from blueprints.v1.services.resource_service import (
    create_resource_service,
    delete_resource_service,
    get_resource_service,
    update_resource_context_service,
    update_resource_service,
)

load_dotenv()

# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_resource = Blueprint("resource", __name__, url_prefix="/private/v1/resource")


@v1_blueprint_resource.route("", methods=["GET"])
@requires_auth
def get_resource(user_id):
    response = get_resource_service(request, user_id)
    return jsonify(response), 200


@v1_blueprint_resource.route("", methods=["POST"])
@requires_auth
def create_resource(user_id):
    try:
        response = create_resource_service(request, user_id)
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@v1_blueprint_resource.route("", methods=["PUT"])
@requires_auth
def update_resources(user_id):
    response = update_resource_service(request)
    return jsonify(response), 200


@v1_blueprint_resource.route("", methods=["DELETE"])
@requires_auth
def delete_resource(user_id):
    response = delete_resource_service(request, user_id)
    return jsonify(response), 200


@v1_blueprint_resource.route("/<id>/context", methods=["PUT"])
@requires_auth
def update_connections(user_id, id):
    response = update_resource_context_service(
        user_id=user_id, request=request, context_id=id
    )
    return jsonify(response), 200
