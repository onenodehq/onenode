from flask import abort, request

def validate_json_content_type():
    if request.content_type != "application/json":
        abort(400, description="Invalid content type. Expected 'application/json'.")
