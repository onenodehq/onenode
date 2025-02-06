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
        # NOTE can be more strict by checking if there is no other fields
        """Checks if a dictionary has the correct structure to be an EmbImage instance."""
        if isinstance(data, dict) and "@embImage" in data:
            attributes = data["@embImage"]
            if (
                isinstance(attributes, dict)
                and "data" in attributes
                and isinstance(attributes["data"], str)
                and "mime_type" in attributes
                and isinstance(attributes["mime_type"], str)
                and attributes["mime_type"].startswith("image/")
            ):
                if attributes["mime_type"] not in supported_mime:
                    raise CustomAPIError(
                        f"Unsupported mime type - {attributes['mime_type']}"
                    )
                return
        raise CustomAPIError(f"Field value is invalid - {data}")
