class Models:
    """All supported model constants, grouped by task and vendor."""

    class TextToEmbedding:
        """Embedding models, by vendor."""
        class OpenAI:
            TEXT_EMBEDDING_3_SMALL = "text-embedding-3-small"
            TEXT_EMBEDDING_3_LARGE = "text-embedding-3-large"
            TEXT_EMBEDDING_ADA_002 = "text-embedding-ada-002"
            
            @classmethod
            def values(cls):
                """Return all available embedding model values."""
                return [
                    cls.TEXT_EMBEDDING_3_SMALL,
                    cls.TEXT_EMBEDDING_3_LARGE,
                    cls.TEXT_EMBEDDING_ADA_002,
                ]

    class ImageToText:
        """Vision‑to‑text models, by vendor."""
        class OpenAI:
            GPT_4O = "gpt-4o"
            GPT_4O_MINI = "gpt-4o-mini"
            O4_MINI = "o4-mini"
            O3 = "o3"
            O1 = "o1"
            O1_PRO = "o1-pro"
            GPT_4_1 = "gpt-4.1"
            GPT_4_1_MINI = "gpt-4.1-mini"
            GPT_4_1_NANO = "gpt-4.1-nano"
            
            @classmethod
            def values(cls):
                """Return all available vision model values."""
                return [
                    cls.GPT_4O,
                    cls.GPT_4O_MINI,
                    cls.O4_MINI,
                    cls.O3,
                    cls.O1,
                    cls.O1_PRO,
                    cls.GPT_4_1,
                    cls.GPT_4_1_MINI,
                    cls.GPT_4_1_NANO,
                ]
