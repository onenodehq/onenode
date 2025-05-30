from errors import CustomAPIError


class Text:
    DEFAULT_EMB_MODEL = "text-embedding-3-small"
    DEFAULT_MAX_CHUNK_SIZE = 200
    DEFAULT_CHUNK_OVERLAP = 20
    DEFAULT_IS_SEPARATOR_REGEX = False
    DEFAULT_SEPARATORS = None
    DEFAULT_KEEP_SEPARATOR = False
    
    @staticmethod
    def is_valid_data(data: dict) -> bool:
        """Checks if a dictionary has the correct structure to be an Text instance."""
        # Check if data is a dictionary
        if not isinstance(data, dict):
            raise CustomAPIError(
                f"Invalid Text format: Expected a dictionary, got {type(data).__name__}",
                status_code=400
            )
        
        # Check if xText key exists
        if "xText" not in data:
            raise CustomAPIError(
                "Invalid Text format: Missing 'xText' key",
                status_code=400
            )
        
        text_data = data["xText"]
        
        # Check if text_data is a dictionary
        if not isinstance(text_data, dict):
            raise CustomAPIError(
                f"Invalid Text format: 'xText' value must be a dictionary, got {type(text_data).__name__}",
                status_code=400
            )
        
        # Check if text field exists
        if "text" not in text_data:
            raise CustomAPIError(
                "Invalid Text format: Missing 'text' field in Text data type",
                status_code=400
            )
        
        # Check if text is a string
        if not isinstance(text_data["text"], str):
            raise CustomAPIError(
                f"Invalid Text format: 'text' must be a string, got {type(text_data['text']).__name__}",
                status_code=400
            )
        
        # Check if text is not empty after stripping
        if not text_data["text"].strip():
            raise CustomAPIError(
                "Invalid Text format: 'text' cannot be empty or contain only whitespace",
                status_code=400
            )
        
        return True
