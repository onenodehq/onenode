from dotenv import load_dotenv
from flask import Blueprint, g, jsonify, request
import logging
from auth.auth_decorator import requires_onenode_auth
from blueprints.v0.services.resource_service import (
    create_resource_service,
    delete_resource_service,
    get_resource_service,
    update_resource_context_service,
    update_resource_service,
)
from utils.email import notify_admin

load_dotenv()

# Define a Blueprint for the '/v1/query' endpoint
private_onenode_blueprint_resource = Blueprint("resource", __name__, url_prefix="/resource")


@private_onenode_blueprint_resource.route("", methods=["GET"])
@requires_onenode_auth
def get_resource():
    user_id = g.user_id
    response = get_resource_service(request, user_id)
    notify_admin("Resource API Used", f"GET resource endpoint accessed by user_id: {user_id}")
    return jsonify(response), 200


@private_onenode_blueprint_resource.route("", methods=["POST"])
@requires_onenode_auth
def create_resource():
    user_id = g.user_id
    try:
        response = create_resource_service(request, user_id)
        notify_admin("Resource API Used", f"POST resource endpoint accessed by user_id: {user_id}")
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Error saving resource: {e}")
        notify_admin("Resource API Error", f"Error in POST resource endpoint by user_id: {user_id}. Error: {str(e)}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@private_onenode_blueprint_resource.route("", methods=["PUT"])
@requires_onenode_auth
def update_resources():
    user_id = g.user_id
    response = update_resource_service(request)
    notify_admin("Resource API Used", f"PUT resource endpoint accessed by user_id: {user_id}")
    return jsonify(response), 200


@private_onenode_blueprint_resource.route("", methods=["DELETE"])
@requires_onenode_auth
def delete_resource():
    user_id = g.user_id
    response = delete_resource_service(request, user_id)
    notify_admin("Resource API Used", f"DELETE resource endpoint accessed by user_id: {user_id}")
    return jsonify(response), 200


@private_onenode_blueprint_resource.route("/<id>/context", methods=["PUT"])
@requires_onenode_auth
def update_connections(id):
    user_id = g.user_id
    response = update_resource_context_service(user_id, request, id)
    notify_admin("Resource API Used", f"PUT resource/{id}/context endpoint accessed by user_id: {user_id}")
    return jsonify(response), 200
