from typing import Optional, List, Dict, Any, Union
from ._models import Models
import base64
import io
import re
import os


class Image:
    """Specialized data type for images with vision model processing."""
    
    # Supported mime types
    SUPPORTED_MIME_TYPES = [
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/gif",
        "image/webp",
    ]

    def __init__(
        self,
        data: Optional[Union[str, bytes, bytearray, io.IOBase]] = None,
    ):
        """Initialize a new Image instance with auto-detected data format."""
        # Handle case where data is None (for internal use, like deserialization)
        if data is None:
            self.data = ""  # Use empty string as placeholder for deserialization
            self.mime_type = ""
        # Handle different input types
        elif isinstance(data, str):
            # String input - could be base64, data URL, HTTP URL, or file path
            if data.startswith("data:"):
                # Data URL format
                match = re.match(r'^data:([^;]+);base64,(.+)$', data)
                if not match:
                    raise ValueError("Invalid data URL format. Expected format: data:image/type;base64,<data>")
                url_mime_type, base64_data = match.groups()
                self.data = base64_data
                self.mime_type = url_mime_type
            elif data.startswith('http'):
                # HTTP URL input
                self.data = data
                # Try to extract mime type from URL extension
                self.mime_type = self._extract_mime_type_from_url(data)
            else:
                # Could be base64 string or file path - try base64 first
                if self.is_valid_data(data):
                    # Valid base64 string
                    self.data = data
                    # Extract mime type from base64 data
                    self.mime_type = self._extract_mime_type_from_base64(data)
                elif self._is_valid_file_path(data):
                    # Local file path - read the file
                    try:
                        with open(data, 'rb') as f:
                            binary_data = f.read()
                        self.data = binary_data
                        # Extract mime type from binary data
                        self.mime_type = self._extract_mime_type_from_binary(binary_data)
                    except (OSError, IOError) as e:
                        raise ValueError(f"Could not read file '{data}': {e}")
                else:
                    raise ValueError("Invalid data: must be a non-empty string containing valid base64-encoded image data, HTTP URL, or valid file path.")
        elif isinstance(data, (bytes, bytearray)):
            # Binary data input (bytes or bytearray)
            self.data = bytes(data)  # Convert bytearray to bytes if needed
            # Extract mime type from binary data
            self.mime_type = self._extract_mime_type_from_binary(self.data)
        elif hasattr(data, 'read'):
            # File-like object input
            self.data = data
            # Extract mime type from file-like object
            self.mime_type = self._extract_mime_type_from_file_like(data)
        else:
            raise ValueError("Invalid data type: must be string (base64/data URL/HTTP URL/file path), bytes, bytearray, or file-like object")
            
        # MIME type validation only matters when indexing
        # so we don't validate it here anymore
        self._chunks: List[str] = []  # Updated by the database
        self.emb_model: Optional[str] = None
        self.vision_model: Optional[str] = None
        self.max_chunk_size: Optional[int] = None
        self.chunk_overlap: Optional[int] = None
        self.is_separator_regex: Optional[bool] = None
        self.separators: Optional[List[str]] = None
        self.keep_separator: Optional[bool] = None
        self.index_enabled: bool = False  # Default to False when index() isn't called

    def _is_valid_file_path(self, path: str) -> bool:
        """Check if string looks like a valid file path and the file exists."""
        if not path or not isinstance(path, str):
            return False
        
        # Check if file exists and has a supported image extension
        if os.path.isfile(path):
            lower_path = path.lower()
            supported_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            return any(lower_path.endswith(ext) for ext in supported_extensions)
        
        return False

    def _extract_mime_type_from_url(self, url: str) -> str:
        """Extract MIME type from URL based on file extension."""
        url_lower = url.lower()
        if url_lower.endswith('.jpg') or url_lower.endswith('.jpeg'):
            return 'image/jpeg'
        elif url_lower.endswith('.png'):
            return 'image/png'
        elif url_lower.endswith('.gif'):
            return 'image/gif'
        elif url_lower.endswith('.webp'):
            return 'image/webp'
        else:
            # Default to JPEG if unable to determine
            return 'image/jpeg'

    def _extract_mime_type_from_base64(self, base64_data: str) -> str:
        """Extract MIME type from base64 data by examining magic bytes."""
        try:
            # Decode enough base64 data to get magic bytes (at least 16 bytes encoded = ~22 chars)
            # Use first 100 chars to be safe, which gives us plenty of decoded bytes
            sample_data = base64_data[:100] if len(base64_data) > 100 else base64_data
            decoded_bytes = base64.b64decode(sample_data)
            return self._extract_mime_type_from_binary(decoded_bytes)
        except Exception:
            # Default to JPEG if unable to determine
            return 'image/jpeg'

    def _extract_mime_type_from_binary(self, binary_data: bytes) -> str:
        """Extract MIME type from binary data by examining magic bytes."""
        if len(binary_data) < 4:
            return 'image/jpeg'  # Default
            
        # Check magic bytes
        if binary_data.startswith(b'\xFF\xD8\xFF'):
            return 'image/jpeg'
        elif binary_data.startswith(b'\x89PNG\r\n\x1a\n'):
            return 'image/png'
        elif binary_data.startswith(b'GIF87a') or binary_data.startswith(b'GIF89a'):
            return 'image/gif'
        elif binary_data.startswith(b'RIFF') and b'WEBP' in binary_data[:12]:
            return 'image/webp'
        else:
            # Default to JPEG if unable to determine
            return 'image/jpeg'

    def _extract_mime_type_from_file_like(self, file_obj: io.IOBase) -> str:
        """Extract MIME type from file-like object by reading magic bytes."""
        try:
            if hasattr(file_obj, 'tell') and hasattr(file_obj, 'seek'):
                current_pos = file_obj.tell()
                file_obj.seek(0)
                magic_bytes = file_obj.read(12)
                file_obj.seek(current_pos)  # Reset position
            else:
                # If we can't seek, read some data but this might consume the stream
                magic_bytes = file_obj.read(12)
            
            return self._extract_mime_type_from_binary(magic_bytes)
        except Exception:
            return 'image/jpeg'  # Default

    def get_data(self) -> Union[str, bytes, io.IOBase]:
        """Get the raw data in its original format."""
        return self.data

    def get_binary_data(self) -> Optional[bytes]:
        """Get binary data regardless of input format."""
        if isinstance(self.data, str):
            # If data contains a URL, we can't return binary data
            if self.data.startswith('http'):
                return None
            try:
                return base64.b64decode(self.data)
            except Exception:
                return None
        elif isinstance(self.data, (bytes, bytearray)):
            return bytes(self.data)
        elif hasattr(self.data, 'read'):
            if hasattr(self.data, 'tell') and hasattr(self.data, 'seek'):
                current_pos = self.data.tell()
                self.data.seek(0)
                data = self.data.read()
                self.data.seek(current_pos)  # Reset position
                return data
            else:
                return self.data.read()
        return None

    def get_base64_data(self) -> Optional[str]:
        """Get base64 data if the original input was a string (not URL)."""
        if isinstance(self.data, str) and not self.data.startswith('http'):
            return self.data
        return None

    def has_binary_data(self) -> bool:
        """Check if this image has binary data (not base64 or URL)."""
        if isinstance(self.data, str):
            return self.data.startswith('http')  # URL is considered as processed data, not binary
        return True  # Non-string data is binary

    def enable_index(
        self,
        *,
        emb_model: Optional[str] = None,
        vision_model: Optional[str] = None,
        max_chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        is_separator_regex: Optional[bool] = None,
        separators: Optional[List[str]] = None,
        keep_separator: Optional[bool] = None,
    ) -> "Image":
        """Fluent builder method to enable indexing and set indexing parameters."""
        # Set index to True when this method is called
        self.index_enabled = True
        
        # MIME type validation happens here when indexing is enabled
        if not self.is_valid_mime_type(self.mime_type):
            supported_list = ", ".join(self.SUPPORTED_MIME_TYPES)
            raise ValueError(f"Unsupported mime type: '{self.mime_type}'. Supported types are: {supported_list}")
        
        if emb_model is not None:
            if not self.is_valid_emb_model(emb_model):
                supported_list = ", ".join(Models.TextToEmbedding.OpenAI.values())
                raise ValueError(f"Invalid embedding model: '{emb_model}' is not supported. Supported models are: {supported_list}")
            self.emb_model = emb_model
            
        if vision_model is not None:
            if not self.is_valid_vision_model(vision_model):
                supported_list = ", ".join(Models.ImageToText.OpenAI.values())
                raise ValueError(f"Invalid vision model: '{vision_model}' is not supported. Supported models are: {supported_list}")
            self.vision_model = vision_model
            
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
        # Check if data contains a URL (string starting with http)
        if isinstance(self.data, str) and self.data.startswith('http'):
            return f'Image({self.data})'
        return "Image(<raw data>)"

    @property
    def chunks(self) -> List[str]:
        """Read-only property for chunks."""
        return self._chunks

    @staticmethod
    def is_valid_data(data: str) -> bool:
        """Validate data is valid base64-encoded string or URL."""
        if not (isinstance(data, str) and data.strip() != ""):
            return False
        # Accept URLs as valid data
        if data.startswith('http'):
            return True
        # Otherwise validate as base64
        try:
            base64.b64decode(data, validate=True)
            return True
        except Exception:
            return False
            
    @classmethod
    def is_valid_mime_type(cls, mime_type: str) -> bool:
        """Check if mime_type is supported."""
        return mime_type in cls.SUPPORTED_MIME_TYPES

    @classmethod
    def is_valid_emb_model(cls, emb_model: Optional[str]) -> bool:
        """Check if embedding model is supported."""
        return emb_model is None or emb_model in Models.TextToEmbedding.OpenAI.values()

    @classmethod
    def is_valid_vision_model(cls, vision_model: Optional[str]) -> bool:
        """Check if vision model is supported."""
        return vision_model is None or vision_model in Models.ImageToText.OpenAI.values()

    def _serialize(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary."""
        # Start with required fields
        result = {
            "xImage": {
                "mime_type": self.mime_type,
                "index": self.index_enabled,  # Always include index flag
            }
        }
        
        # Never include binary/base64 data in JSON - always send as separate binary
        # The API layer will use get_binary_data() to extract bytes for transmission
        
        # Only include chunks if they exist
        if self._chunks:
            result["xImage"]["chunks"] = self._chunks
            
        # Include data field (which can contain URL or binary data)
        if self.data is not None:
            if isinstance(self.data, str):
                result["xImage"]["data"] = self.data
            # For binary data, we don't include it in JSON serialization
            # The API layer will handle binary data separately

        # Add other fields only if they are not None
        if self.emb_model is not None:
            result["xImage"]["emb_model"] = self.emb_model
        if self.vision_model is not None:
            result["xImage"]["vision_model"] = self.vision_model
        if self.max_chunk_size is not None:
            result["xImage"]["max_chunk_size"] = self.max_chunk_size
        if self.chunk_overlap is not None:
            result["xImage"]["chunk_overlap"] = self.chunk_overlap
        if self.is_separator_regex is not None:
            result["xImage"]["is_separator_regex"] = self.is_separator_regex
        if self.separators is not None:
            result["xImage"]["separators"] = self.separators
        if self.keep_separator is not None:
            result["xImage"]["keep_separator"] = self.keep_separator
            
        return result

    @classmethod
    def _deserialize(cls, data: Dict[str, Any]) -> "Image":
        """Create Image from JSON dictionary retrieved from database."""
        # Check if the data is wrapped with 'xImage'
        if "xImage" in data:
            data = data["xImage"]
            
        if "mime_type" not in data:
            raise ValueError("JSON data must include 'mime_type' under 'xImage'.")
        
        # Get data from database (can be URL or binary data)
        # After processing, the data field contains the public URL
        data_value = data.get("data")
        instance = cls(data=data_value)
        
        # Override the auto-detected mime_type with the one from database
        instance.mime_type = data.get("mime_type")
        
        # Set index_enabled directly from database field (no validation needed)
        instance.index_enabled = data.get("index", False)
        
        # Set all attributes directly without calling enable_index() since
        # this data comes from database and was already validated server-side
        if "emb_model" in data:
            instance.emb_model = data.get("emb_model")
        if "vision_model" in data:
            instance.vision_model = data.get("vision_model")
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
        
        # Set chunks if they exist in the JSON
        if "chunks" in data:
            instance._chunks = data.get("chunks", [])
        
        return instance

    def serialize(self) -> Dict[str, Any]:
        """Public method to serialize the Image."""
        return self._serialize()


