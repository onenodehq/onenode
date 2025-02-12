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
        # NOTE can be more strict by checking if there is no other fields
        """Checks if a dictionary has the correct structure to be an EmbText instance."""
        if isinstance(data, dict) and "@embText" in data:
            text_data = data["@embText"]
            if (
                isinstance(text_data, dict)
                and "text" in text_data
                and isinstance(text_data["text"], str)
                and text_data["text"].strip()
            ):
                return

        raise CustomAPIError(f"Field value is invalid - {data}")
