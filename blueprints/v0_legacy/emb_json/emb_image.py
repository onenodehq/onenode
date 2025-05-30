from errors import CustomAPIError

DEFAULT_IMG_EMB_MODEL = "text-embedding-3-small"
DEFAULT_IMG_VISION_MODEL = "gpt-4o-mini"
DEFAULT_IMG_MAX_CHUNK_SIZE = 200
DEFAULT_IMG_CHUNK_OVERLAP = 20
DEFAULT_IMG_IS_SEPARATOR_REGEX = False
DEFAULT_IMG_SEPARATORS = None
DEFAULT_IMG_KEEP_SEPARATOR = False

supported_mime = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
]


class EmbImage:
    @staticmethod
    def is_valid_data(data: dict) -> bool:
        """Checks if a dictionary has the correct structure to be an EmbImage instance."""
        # Check if data is a dictionary
        if not isinstance(data, dict):
            raise CustomAPIError(
                f"Invalid EmbImage format: Expected a dictionary, got {type(data).__name__}",
                status_code=400
            )
        
        # Check if @embImage key exists
        if "@embImage" not in data:
            raise CustomAPIError(
                "Invalid EmbImage format: Missing '@embImage' key",
                status_code=400
            )
        
        attributes = data["@embImage"]
        
        # Check if attributes is a dictionary
        if not isinstance(attributes, dict):
            raise CustomAPIError(
                f"Invalid EmbImage format: '@embImage' value must be a dictionary, got {type(attributes).__name__}",
                status_code=400
            )
        
        # Check if data field exists
        if "data" not in attributes:
            raise CustomAPIError(
                "Invalid EmbImage format: Missing 'data' field in '@embImage'",
                status_code=400
            )
        
        # Check if data is a string
        if not isinstance(attributes["data"], str):
            raise CustomAPIError(
                f"Invalid EmbImage format: 'data' must be a string, got {type(attributes['data']).__name__}",
                status_code=400
            )
        
        # Check if mime_type field exists
        if "mime_type" not in attributes:
            raise CustomAPIError(
                "Invalid EmbImage format: Missing 'mime_type' field in '@embImage'",
                status_code=400
            )
        
        # Check if mime_type is a string
        if not isinstance(attributes["mime_type"], str):
            raise CustomAPIError(
                f"Invalid EmbImage format: 'mime_type' must be a string, got {type(attributes['mime_type']).__name__}",
                status_code=400
            )
        
        # Check if mime_type starts with "image/"
        if not attributes["mime_type"].startswith("image/"):
            raise CustomAPIError(
                f"Invalid EmbImage format: 'mime_type' must start with 'image/', got '{attributes['mime_type']}'",
                status_code=400
            )
        
        # Check if mime_type is supported
        if attributes["mime_type"] not in supported_mime:
            supported_list = ", ".join(supported_mime)
            raise CustomAPIError(
                f"Unsupported mime type: '{attributes['mime_type']}'. Supported types are: {supported_list}",
                status_code=400
            )
        
        return True
