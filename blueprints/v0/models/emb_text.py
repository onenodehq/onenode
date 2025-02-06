class EmbText:
    @staticmethod
    def is_valid_data(data: dict) -> bool:
        # NOTE can be more strict by checking if there is no other fields
        """Checks if a dictionary has the correct structure to be an EmbText instance."""
        if isinstance(data, dict) and "@embText" in data:
            text_data = data["@embText"]
            if isinstance(text_data, dict) and "text" in text_data and isinstance(text_data["text"], str):
                return True
        return False