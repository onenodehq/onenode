from errors import CustomAPIError


class Text:
    DEFAULT_EMB_MODEL = "text-embedding-3-small"
    DEFAULT_MAX_CHUNK_SIZE = 200
    DEFAULT_CHUNK_OVERLAP = 20
    DEFAULT_IS_SEPARATOR_REGEX = False
    DEFAULT_SEPARATORS = None
    DEFAULT_KEEP_SEPARATOR = False
    DEFAULT_INDEX = True
    
    @classmethod
    def extract_params(cls, data: dict) -> dict:
        """
        Extract and validate parameters from xText data.
        Returns a dictionary with all parameters including defaults.
        """
        cls.is_valid_data(data=data)
        
        text_data = data["xText"]
        
        params = {
            "text": text_data["text"],
            "emb_model": text_data.get("emb_model", cls.DEFAULT_EMB_MODEL),
            "max_chunk_size": text_data.get("max_chunk_size", cls.DEFAULT_MAX_CHUNK_SIZE),
            "chunk_overlap": text_data.get("chunk_overlap", cls.DEFAULT_CHUNK_OVERLAP),
            "is_separator_regex": text_data.get("is_separator_regex", cls.DEFAULT_IS_SEPARATOR_REGEX),
            "separators": text_data.get("separators", cls.DEFAULT_SEPARATORS),
            "keep_separator": text_data.get("keep_separator", cls.DEFAULT_KEEP_SEPARATOR),
            "index": text_data.get("index", cls.DEFAULT_INDEX),
        }
        
        # Validate parameter types and ranges
        cls._validate_params(params)
        
        return params
    
    @classmethod
    def _validate_params(cls, params: dict) -> None:
        """Validate parameter types and values."""
        # Validate emb_model
        if not isinstance(params["emb_model"], str):
            raise CustomAPIError(
                f"Invalid emb_model: Expected string, got {type(params['emb_model']).__name__}",
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
