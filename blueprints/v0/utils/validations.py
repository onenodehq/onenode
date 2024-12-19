from flask import request

from errors import CustomAPIError


def validate_json_content_type():
    if request.content_type != "application/json":
        raise CustomAPIError("Invalid content type. Expected 'application/json'.")
