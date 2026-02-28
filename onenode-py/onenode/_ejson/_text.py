from typing import Optional, List, Dict, Any
from ._models import Models


class Text:
    """Specialized data type for text that will be automatically embedded."""
    def __init__(self, text: str):
        """Initialize a new Text instance with the given text content."""
        if not self.is_valid_text(text):
            raise ValueError("Invalid text: must be a non-empty string.")

        self.text = text
        self._chunks: List[str] = []  # Updated by the database
        
        # Optional parameters - set to None initially
        self.emb_model: Optional[str] = None
        self.max_chunk_size: Optional[int] = None
        self.chunk_overlap: Optional[int] = None
        self.is_separator_regex: Optional[bool] = None
        self.separators: Optional[List[str]] = None
        self.keep_separator: Optional[bool] = None
        self.index_enabled: bool = False  # Default to False when index() isn't called

    def enable_index(
        self,
        *,
        emb_model: Optional[str] = None,
        max_chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        is_separator_regex: Optional[bool] = None,
        separators: Optional[List[str]] = None,
        keep_separator: Optional[bool] = None,
    ) -> "Text":
        """Fluent builder method to enable indexing and set embedding parameters."""
        # Set index to True when this method is called
        self.index_enabled = True
        
        # Validate and set embedding model if provided
        if emb_model is not None:
            if not self.is_valid_emb_model(emb_model):
                raise ValueError(f"Invalid embedding model: {emb_model} is not supported.")
            self.emb_model = emb_model
            
        # Set other parameters if provided
        if max_chunk_size is not None:
            self.max_chunk_size = max_chunk_size
            
        if chunk_overlap is not None:
            self.chunk_overlap = chunk_overlap
            
        if is_separator_regex is not None:
            self.is_separator_regex = is_separator_regex
            
        if separators is not None:
            self.separators = separators
            
        if keep_separator is not None:
            self.keep_separator = keep_separator
            
        return self

    def __repr__(self):
        return f'Text("{self.text}")'

    @property
    def chunks(self) -> List[str]:
        """Read-only property for accessing text chunks."""
        return self._chunks

    @staticmethod
    def is_valid_text(text: str) -> bool:
        """Validate text is a non-empty string."""
        return isinstance(text, str) and text.strip() != ""

    @classmethod
    def is_valid_emb_model(cls, emb_model: str) -> bool:
        """Validate embedding model is supported."""
        return emb_model in Models.TextToEmbedding.OpenAI.values()

    def _serialize(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary."""
        result = {
            "xText": {
                "text": self.text,
                "chunks": self._chunks,
                "index": self.index_enabled,  # Always include index flag
            }
        }
        
        # Add other fields only if they are not None (when set via index() method)
        if self.emb_model is not None:
            result["xText"]["emb_model"] = self.emb_model
        if self.max_chunk_size is not None:
            result["xText"]["max_chunk_size"] = self.max_chunk_size
        if self.chunk_overlap is not None:
            result["xText"]["chunk_overlap"] = self.chunk_overlap
        if self.is_separator_regex is not None:
            result["xText"]["is_separator_regex"] = self.is_separator_regex
        if self.separators is not None:
            result["xText"]["separators"] = self.separators
        if self.keep_separator is not None:
            result["xText"]["keep_separator"] = self.keep_separator
            
        return result

    @classmethod
    def _deserialize(cls, data: Dict[str, Any]) -> "Text":
        # Check if the data is wrapped with 'xText'
        if "xText" in data:
            data = data["xText"]

        text = data.get("text")
        if text is None:
            raise ValueError("JSON data must include 'text' under Text data type.")

        # Create the instance with just the text
        instance = cls(text)
        
        # If index is true in the data, call enable_index() to set up indexing
        if data.get("index", False):
            instance.enable_index(
                emb_model=data.get("emb_model"),
                max_chunk_size=data.get("max_chunk_size"),
                chunk_overlap=data.get("chunk_overlap"),
                is_separator_regex=data.get("is_separator_regex"),
                separators=data.get("separators"),
                keep_separator=data.get("keep_separator"),
            )
        # Otherwise just set the attributes without setting index_enabled=True
        else:
            if "emb_model" in data:
                instance.emb_model = data.get("emb_model")
            if "max_chunk_size" in data:
                instance.max_chunk_size = data.get("max_chunk_size")
            if "chunk_overlap" in data:
                instance.chunk_overlap = data.get("chunk_overlap")
            if "is_separator_regex" in data:
                instance.is_separator_regex = data.get("is_separator_regex")
            if "separators" in data:
                instance.separators = data.get("separators")
            if "keep_separator" in data:
                instance.keep_separator = data.get("keep_separator")

        instance._chunks = data.get("chunks", [])
        return instance
