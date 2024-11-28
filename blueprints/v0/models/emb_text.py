class EmbText:
    def __init__(self, text: str, chunks: list[str] = None):
        self.text = text
        self.chunks = chunks if chunks is not None else []

    def add_chunk(self, chunk: str):
        """Adds a chunk to the list of chunks."""
        self.chunks.append(chunk)

    def get_chunks(self) -> list[str]:
        """Returns the list of chunks."""
        return self.chunks

    def to_dict(self) -> dict:
        """Converts the EmbText instance to a dictionary format compatible with MongoDB extended JSON."""
        return {"@embText": {"text": self.text, "chunks": self.chunks}}

    @staticmethod
    def from_dict(data: dict):
        """Creates a EmbText instance from a dictionary."""
        if "@embText" in data:
            text_data = data["@embText"]
            return EmbText(text=text_data["text"], chunks=text_data["chunks"])
        raise ValueError("Invalid data format for EmbText")
    
    @staticmethod
    def is_valid_data(data: dict) -> bool:
        # NOTE can be more strict by checking if there is no other fields
        """Checks if a dictionary has the correct structure to be an EmbText instance."""
        if isinstance(data, dict) and "@embText" in data:
            text_data = data["@embText"]
            if isinstance(text_data, dict) and "text" in text_data and isinstance(text_data["text"], str):
                if "chunks" in text_data:
                    return isinstance(text_data["chunks"], list) and all(isinstance(chunk, str) for chunk in text_data["chunks"])
                return True
        return False

    def __repr__(self):
        return f'EmbText(text="{self.text}", chunks={self.chunks})'