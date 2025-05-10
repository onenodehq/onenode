from errors import CustomAPIError

class Image:
    DEFAULT_EMB_MODEL = "text-embedding-3-small"
    DEFAULT_VISION_MODEL = "gpt-4o-mini"
    DEFAULT_MAX_CHUNK_SIZE = 200
    DEFAULT_CHUNK_OVERLAP = 20
    DEFAULT_IS_SEPARATOR_REGEX = False
    DEFAULT_SEPARATORS = None
    DEFAULT_KEEP_SEPARATOR = False

    supported_mime = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ]
    @staticmethod
    def is_valid_data(data: dict) -> bool:
        """Checks if a dictionary has the correct structure to be an Image instance."""
        # Check if data is a dictionary
        if not isinstance(data, dict):
            raise CustomAPIError(
                f"Invalid Image format: Expected a dictionary, got {type(data).__name__}",
                status_code=400
            )
        
        # Check if xImage key exists
        if "xImage" not in data:
            raise CustomAPIError(
                "Invalid Image format: Missing 'xImage' key",
                status_code=400
            )
        
        attributes = data["xImage"]
        
        # Check if attributes is a dictionary
        if not isinstance(attributes, dict):
            raise CustomAPIError(
                f"Invalid Image format: 'xImage' value must be a dictionary, got {type(attributes).__name__}",
                status_code=400
            )
        
        # Check if data field exists
        if "data" not in attributes:
            raise CustomAPIError(
                "Invalid Image format: Missing 'data' field in Image data type",
                status_code=400
            )
        
        # Check if data is a string
        if not isinstance(attributes["data"], str):
            raise CustomAPIError(
                f"Invalid Image format: 'data' must be a string, got {type(attributes['data']).__name__}",
                status_code=400
            )
        
        # Check if mime_type field exists
        if "mime_type" not in attributes:
            raise CustomAPIError(
                "Invalid Image format: Missing 'mime_type' field in Image data type",
                status_code=400
            )
        
        # Check if mime_type is a string
        if not isinstance(attributes["mime_type"], str):
            raise CustomAPIError(
                f"Invalid Image format: 'mime_type' must be a string, got {type(attributes['mime_type']).__name__}",
                status_code=400
            )
        
        # Check if mime_type is supported
        if attributes["mime_type"] not in Image.supported_mime:
            supported_list = ", ".join(Image.supported_mime)
            raise CustomAPIError(
                f"Unsupported mime type: '{attributes['mime_type']}'. Supported types are: {supported_list}",
                status_code=400
            )
        
        return True
