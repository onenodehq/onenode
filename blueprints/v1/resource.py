from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from auth.auth import jwt_required
import logging

from blueprints.v1.services.resource_service import (
    create_resource_service,
    delete_resource_service,
    get_resource_service,
    update_resource_connection_service,
    update_resource_service,
)

load_dotenv()

# Define a Blueprint for the '/v1/query' endpoint
v1_blueprint_resource = Blueprint("resource", __name__, url_prefix="/v1/resource")


@v1_blueprint_resource.route("/", methods=["GET"])
@jwt_required
def get_resource(user_id):
    try:
        response = get_resource_service(request, user_id)
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error fetching resource: {e}")
        return jsonify({"error": str(e)}), 500


@v1_blueprint_resource.route("/", methods=["POST"])
@jwt_required
def create_resource(user_id):
    try:
        response = create_resource_service(request, user_id)
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@v1_blueprint_resource.route("/", methods=["PUT"])
@jwt_required
def update_resources(user_id):
    try:
        response = update_resource_service(request)
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error updating resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@v1_blueprint_resource.route("/", methods=["DELETE"])
@jwt_required
def delete_resource(user_id):
    try:
        response = delete_resource_service(request, user_id)
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error deleting resource: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@v1_blueprint_resource.route("/<id>/connection", methods=["PUT"])
@jwt_required
def update_connections(user_id, id):
    try:
        response = update_resource_connection_service(
            user_id=user_id, request=request, main_id=id
        )
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error updating connections: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
