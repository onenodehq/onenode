from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from auth.auth import jwt_required
import logging

from blueprints.v1.services.resource_service import (
    create_resource_service,
    delete_resource_service,
    get_resource_service,
    update_resource_context_service,
    update_resource_service,
)

load_dotenv()

# Define a Blueprint for the '/v1/query' endpoint
private_v1_blueprint_resource = Blueprint("resource", __name__, url_prefix="/private/v1/resource")


@private_v1_blueprint_resource.route("", methods=["GET"])
@jwt_required
def get_resource(user_id):
    response = get_resource_service(request, user_id)
    return jsonify(response), 200


@private_v1_blueprint_resource.route("", methods=["POST"])
@jwt_required
def create_resource(user_id):
    response = create_resource_service(request, user_id)
    return jsonify(response), 200


@private_v1_blueprint_resource.route("", methods=["PUT"])
@jwt_required
def update_resources(user_id):
    response = update_resource_service(request)
    return jsonify(response), 200


@private_v1_blueprint_resource.route("", methods=["DELETE"])
@jwt_required
def delete_resource(user_id):
    response = delete_resource_service(request, user_id)
    return jsonify(response), 200


@private_v1_blueprint_resource.route("/<id>/context", methods=["PUT"])
@jwt_required
def update_connections(user_id, id):
    response = update_resource_context_service(
        user_id=user_id, request=request, context_id=id
    )
    return jsonify(response), 200
