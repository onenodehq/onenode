import os
from dotenv import load_dotenv
from errors import AuthError, CustomAPIError
from pymongo.errors import InvalidOperation
from logger import logger
from utils.email import notify_admin
import celery_tasks

load_dotenv()

from flask import jsonify, request
from blueprints.private.routes import private_blueprint
from blueprints.v0.routes import v0_blueprint_root
from flask_cors import CORS
from create_app import application

CORS(application)

# Register the Blueprint
application.register_blueprint(private_blueprint)
application.register_blueprint(v0_blueprint_root)


@application.errorhandler(AuthError)
def handle_auth_error(ex):
    logger.error(
        f"AuthError: {ex.message}",
        exc_info=True,
    )
    response = {
        "status": "error",
        "code": ex.status_code,
        "message": ex.message,
    }
    return jsonify(response), ex.status_code


@application.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Exception: {e}", exc_info=True)
    response = {
        "status": "error",
        "code": 500,
        "message": "An unexpected error occurred.",
    }
    notify_admin(
        "An unexpected error occurred",
        f"An unexpected error occurred: {e}",
    )
    return jsonify(response), 500


@application.errorhandler(404)
def not_found(error):
    application.logger.warning(
        f"404 Not Found: {request.method} {request.path} from {request.remote_addr} "
        f"User-Agent: {request.headers.get('User-Agent')}"
    )
    return jsonify(error="Not Found"), 404


@application.errorhandler(405)
def method_not_allowed(error):
    application.logger.warning(
        f"405 Method Not Allowed: {request.method} {request.path} from {request.remote_addr} "
        f"User-Agent: {request.headers.get('User-Agent')}"
    )
    return (jsonify(error="Method Not Allowed"), 405)


@application.errorhandler(CustomAPIError)
def handle_path_not_found_error(e):
    response = {
        "status": "error",
        "code": e.status_code,
        "message": e.message,
    }
    return jsonify(response), e.status_code


@application.errorhandler(InvalidOperation)
def handle_path_not_found_error(e):
    response = {
        "status": "error",
        "code": 400,
        "message": "Operation is invalid.",
    }
    return jsonify(response), 400


# Home route
@application.route("/")
def home():
    return f"Welcome to OneNode API! Visit https://wwww.onenode.ai for more information :)"


# Only for development environment
if __name__ == "__main__":
    application.run()
