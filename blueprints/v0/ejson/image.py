from errors import CustomAPIError
import base64

class Image:
    DEFAULT_EMB_MODEL = "text-embedding-3-small"
    DEFAULT_VISION_MODEL = "gpt-4o-mini"
    DEFAULT_MAX_CHUNK_SIZE = 200
    DEFAULT_CHUNK_OVERLAP = 20
    DEFAULT_IS_SEPARATOR_REGEX = False
    DEFAULT_SEPARATORS = None
    DEFAULT_KEEP_SEPARATOR = False
    DEFAULT_INDEX = True

    supported_mime = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ]
    
    @classmethod
    def extract_params(cls, data: dict, request_files: dict = None, doc_index: int = 0, parent_path: str = "") -> dict:
        cls.is_valid_data_structure(data=data)
        
        image_data = data["xImage"]
        
        # Build the expected form field name for binary data using dot notation
        if parent_path:
            field_path = f"doc_{doc_index}.{parent_path}.xImage.data"
        else:
            field_path = f"doc_{doc_index}.xImage.data"
        
        # Get binary data from multipart files
        binary_data = None
        if request_files and field_path in request_files:
            file_obj = request_files[field_path]
            binary_data = file_obj.read()
            file_obj.seek(0)  # Reset file pointer for potential future reads
        
        params = {
            "data": binary_data,  # Binary data instead of base64
            "mime_type": image_data["mime_type"],
            "emb_model": image_data.get("emb_model", cls.DEFAULT_EMB_MODEL),
            "vision_model": image_data.get("vision_model", cls.DEFAULT_VISION_MODEL),
            "max_chunk_size": image_data.get("max_chunk_size", cls.DEFAULT_MAX_CHUNK_SIZE),
            "chunk_overlap": image_data.get("chunk_overlap", cls.DEFAULT_CHUNK_OVERLAP),
            "is_separator_regex": image_data.get("is_separator_regex", cls.DEFAULT_IS_SEPARATOR_REGEX),
            "separators": image_data.get("separators", cls.DEFAULT_SEPARATORS),
            "keep_separator": image_data.get("keep_separator", cls.DEFAULT_KEEP_SEPARATOR),
            "index": image_data.get("index", cls.DEFAULT_INDEX),
        }
        
        # Validate parameter types and ranges
        cls._validate_params(params)
        
        return params
    
    @classmethod
    def _validate_params(cls, params: dict) -> None:
        """Validate parameter types and values."""
        # Validate binary data exists
        if params["data"] is None:
            raise CustomAPIError(
                "Missing binary data: No multipart file found for xImage data field",
                status_code=400
            )
        
        if not isinstance(params["data"], bytes):
            raise CustomAPIError(
                f"Invalid binary data: Expected bytes, got {type(params['data']).__name__}",
                status_code=400
            )
        
        # Validate emb_model
        if not isinstance(params["emb_model"], str):
            raise CustomAPIError(
                f"Invalid emb_model: Expected string, got {type(params['emb_model']).__name__}",
                status_code=400
            )
        
        # Validate vision_model
        if not isinstance(params["vision_model"], str):
            raise CustomAPIError(
                f"Invalid vision_model: Expected string, got {type(params['vision_model']).__name__}",
                status_code=400
            )
        
        # Validate max_chunk_size
        if not isinstance(params["max_chunk_size"], int) or params["max_chunk_size"] <= 0:
            raise CustomAPIError(
                f"Invalid max_chunk_size: Expected positive integer, got {params['max_chunk_size']}",
                status_code=400
            )
        
        # Validate chunk_overlap
        if not isinstance(params["chunk_overlap"], int) or params["chunk_overlap"] < 0:
            raise CustomAPIError(
                f"Invalid chunk_overlap: Expected non-negative integer, got {params['chunk_overlap']}",
                status_code=400
            )
        
        # Validate chunk_overlap is not larger than max_chunk_size
        if params["chunk_overlap"] >= params["max_chunk_size"]:
            raise CustomAPIError(
                f"Invalid chunk_overlap: chunk_overlap ({params['chunk_overlap']}) must be less than max_chunk_size ({params['max_chunk_size']})",
                status_code=400
            )
        
        # Validate is_separator_regex
        if not isinstance(params["is_separator_regex"], bool):
            raise CustomAPIError(
                f"Invalid is_separator_regex: Expected boolean, got {type(params['is_separator_regex']).__name__}",
                status_code=400
            )
        
        # Validate separators
        if params["separators"] is not None and not isinstance(params["separators"], list):
            raise CustomAPIError(
                f"Invalid separators: Expected list or None, got {type(params['separators']).__name__}",
                status_code=400
            )
        
        # Validate keep_separator
        if not isinstance(params["keep_separator"], bool):
            raise CustomAPIError(
                f"Invalid keep_separator: Expected boolean, got {type(params['keep_separator']).__name__}",
                status_code=400
            )
        
        # Validate index
        if not isinstance(params["index"], bool):
            raise CustomAPIError(
                f"Invalid index: Expected boolean, got {type(params['index']).__name__}",
                status_code=400
            )
    
    @staticmethod
    def is_valid_data_structure(data: dict) -> bool:
        """Checks if a dictionary has the correct structure to be an Image instance (without requiring data field)."""
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
        
        # Note: We no longer require 'data' field in JSON since it comes from multipart files
        
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

    @staticmethod
    def is_valid_data(data: dict) -> bool:
        """Legacy method for backward compatibility - checks for base64 data field."""
        # Check basic structure first
        Image.is_valid_data_structure(data)
        
        attributes = data["xImage"]
        
        # Check if data field exists (for backward compatibility)
        if "data" not in attributes:
            raise CustomAPIError(
                "Invalid Image format: Missing 'data' field in Image data type",
                status_code=400
            )
        
        # Check if data is a string (base64)
        if not isinstance(attributes["data"], str):
            raise CustomAPIError(
                f"Invalid Image format: 'data' must be a string, got {type(attributes['data']).__name__}",
                status_code=400
            )
        
        return True

    @staticmethod
    def binary_to_base64(binary_data: bytes) -> str:
        """Convert binary data to base64 string for existing processing pipeline."""
        return base64.b64encode(binary_data).decode('utf-8')
