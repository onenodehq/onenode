from errors import CustomAPIError


DEFAULT_TXT_EMB_MODEL = "text-embedding-3-small"
DEFAULT_TXT_MAX_CHUNK_SIZE = 200
DEFAULT_TXT_CHUNK_OVERLAP = 20
DEFAULT_TXT_IS_SEPARATOR_REGEX = False
DEFAULT_TXT_SEPARATORS = None
DEFAULT_TXT_KEEP_SEPARATOR = False


class EmbText:
    @staticmethod
    def is_valid_data(data: dict) -> bool:
        """Checks if a dictionary has the correct structure to be an EmbText instance."""
        # Check if data is a dictionary
        if not isinstance(data, dict):
            raise CustomAPIError(
                f"Invalid EmbText format: Expected a dictionary, got {type(data).__name__}",
                status_code=400
            )
        
        # Check if @embText key exists
        if "@embText" not in data:
            raise CustomAPIError(
                "Invalid EmbText format: Missing '@embText' key",
                status_code=400
            )
        
        text_data = data["@embText"]
        
        # Check if text_data is a dictionary
        if not isinstance(text_data, dict):
            raise CustomAPIError(
                f"Invalid EmbText format: '@embText' value must be a dictionary, got {type(text_data).__name__}",
                status_code=400
            )
        
        # Check if text field exists
        if "text" not in text_data:
            raise CustomAPIError(
                "Invalid EmbText format: Missing 'text' field in '@embText'",
                status_code=400
            )
        
        # Check if text is a string
        if not isinstance(text_data["text"], str):
            raise CustomAPIError(
                f"Invalid EmbText format: 'text' must be a string, got {type(text_data['text']).__name__}",
                status_code=400
            )
        
        # Check if text is not empty after stripping
        if not text_data["text"].strip():
            raise CustomAPIError(
                "Invalid EmbText format: 'text' cannot be empty or contain only whitespace",
                status_code=400
            )
        
        return True
