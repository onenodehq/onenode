import json

from bson import json_util
from bson.errors import InvalidBSON, InvalidDocument, InvalidId

from errors import CustomAPIError


JSON_PARSE_ERRORS = (
    json.JSONDecodeError,
    InvalidBSON,
    InvalidDocument,
    InvalidId,
    TypeError,
    ValueError,
)


def load_json_form_field(value, field_name):
    try:
        return json_util.loads(value)
    except JSON_PARSE_ERRORS as exc:
        raise CustomAPIError(
            message=f"Invalid JSON in '{field_name}'.",
            status_code=400,
        ) from exc


def load_optional_json_form_field(value, field_name):
    if not value:
        return None
    return load_json_form_field(value, field_name)
