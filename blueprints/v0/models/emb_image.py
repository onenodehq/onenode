class EmbImage:
    @staticmethod
    def is_valid_data(data: dict) -> bool:
        """Checks if a dictionary has the correct structure to be an EmbContent instance."""
        # Ensure the dictionary only has one key: "@embImage"
        if not isinstance(data, dict) or list(data.keys()) != ["@embImage"]:
            return False

        content_data = data["@embImage"]
        if not isinstance(content_data, dict):
            return False

        status = content_data.get("status", "")
        if status == "":
            # Ensure 'data' and 'mimeType' fields exist and are strings
            return isinstance(content_data.get("data"), str) and isinstance(
                content_data.get("mimeType"), str
            )
        elif status == "processed":
            # Ensure 'text' is a string and 'chunks' is a list of strings
            return (
                isinstance(content_data.get("text"), str)
                and isinstance(content_data.get("chunks"), list)
                and all(isinstance(chunk, str) for chunk in content_data["chunks"])
            )

        return False
