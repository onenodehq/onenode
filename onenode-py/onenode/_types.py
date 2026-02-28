from typing import TypedDict, Optional, List, Any, Literal

"""Type definitions for OneNode API responses."""

class Projection(TypedDict):
    """OneNode-style projection configuration for controlling returned fields.
    
    Controls which fields are returned in query results.
    
    Examples:
        - {"mode": "include", "fields": ["name", "email"]} - Return only name and email
        - {"mode": "exclude", "fields": ["password"]} - Return all except password  
        - {"mode": "include"} - Return entire document
        - {"mode": "exclude"} - Return only _id field
    """
    mode: Literal["include", "exclude"]
    fields: Optional[List[str]]

class QueryResponse:
    """Single match from a semantic search query with attribute-style access.
    
    Provides dot notation access for fixed fields:
    - match.chunk - Text chunk that matched the query
    - match.path - Document field path  
    - match.chunk_n - Index of the chunk
    - match.score - Similarity score (0-1)
    - match.document - Full document containing the match (regular dict)
    - match.embedding - Embedding vector embedding (optional, when include_embedding=True)
    """
    
    def __init__(self, data: dict):
        """Initialize QueryResponse with raw response data."""
        self._data = data
    
    @property
    def chunk(self) -> Optional[str]:
        """Text chunk that matched the query."""
        chunk_value = self._data.get('chunk')
        # Return None for None values instead of empty string 
        return chunk_value
    
    @property
    def path(self) -> str:
        """Document field path where the match was found."""
        return self._data.get('path', '')
    
    @property
    def chunk_n(self) -> int:
        """Index of the chunk."""
        return self._data.get('chunk_n', 0)
    
    @property
    def score(self) -> float:
        """Similarity score (0-1)."""
        return self._data.get('score', 0.0)
    
    @property
    def document(self) -> dict:
        """Full document containing the match (regular dict)."""
        return self._data.get('document', {})
    
    @property
    def embedding(self) -> Optional[List[float]]:
        """Embedding vector embedding (only present when include_embedding=True)."""
        return self._data.get('embedding')
    
    def __repr__(self):
        """String representation of the QueryResponse."""
        # Check if chunk exists in the original data and is not None
        chunk_value = self._data.get('chunk')
        if chunk_value is not None and chunk_value:
            chunk_preview = chunk_value[:50]
            return f"QueryResponse(chunk='{chunk_preview}...', score={self.score}, path='{self.path}')"
        else:
            return f"QueryResponse(score={self.score}, path='{self.path}')"


class QueryResponseTyped(TypedDict):
    """Single match from a semantic search query (TypedDict version)."""
    chunk: str  # Text chunk that matched the query
    path: str   # Document field path
    chunk_n: int  # Index of the chunk
    score: float  # Similarity score (0-1)
    document: dict  # Full document containing the match
    embedding: Optional[List[float]]  # Embedding vector embedding (optional)


class InsertResponse:
    """Insert operation response with attribute-style access.
    
    Provides dot notation access for fixed fields:
    - response.inserted_ids - List of inserted document IDs
    """
    
    def __init__(self, data: dict):
        """Initialize InsertResponse with raw response data."""
        self._data = data
    
    @property
    def inserted_ids(self) -> List[str]:
        """List of inserted document IDs."""
        return self._data.get('inserted_ids', [])
    
    def __repr__(self):
        """String representation of the InsertResponse."""
        count = len(self.inserted_ids)
        return f"InsertResponse(inserted_ids={count} documents)"
