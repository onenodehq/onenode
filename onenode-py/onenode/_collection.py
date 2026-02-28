from bson import (
    Code,
    MaxKey,
    MinKey,
    Regex,
    Timestamp,
    ObjectId,
    Decimal128,
    Binary,
)
from datetime import datetime
import requests
import json
from ._types import QueryResponse, InsertResponse, Projection
from ._ejson._text import Text
from ._ejson._image import Image

# Serialization for BSON types
BSON_SERIALIZERS = {
    Text: lambda v: {"xText": v.serialize()},
    Image: lambda v: {"xImage": v.serialize()},
    ObjectId: lambda v: {"$oid": str(v)},
    datetime: lambda v: {"$date": v.isoformat()},
    Decimal128: lambda v: {"$numberDecimal": str(v)},
    Binary: lambda v: {"$binary": v.hex()},
    Regex: lambda v: {"$regex": v.pattern, "$options": v.flags},
    Code: lambda v: {"$code": str(v)},
    Timestamp: lambda v: {"$timestamp": {"t": v.time, "i": v.inc}},
    MinKey: lambda v: {"$minKey": 1},
    MaxKey: lambda v: {"$maxKey": 1},
}


class APIClientError(Exception):
    """Base class for all API client-related errors."""

    def __init__(self, status_code, message):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


class AuthenticationError(APIClientError):
    """Error raised for authentication-related issues."""
    pass


class ClientRequestError(APIClientError):
    """Error raised for client-side issues such as validation errors."""
    pass


class ServerError(APIClientError):
    """Error raised for server-side issues."""
    pass


class Collection:
    """Collection in OneNode for document operations and semantic search."""
    
    def __init__(
        self, api_key: str, project_id: str, db_name: str, collection_name: str
    ):
        """Initialize collection instance."""
        self.api_key = api_key
        self.project_id = project_id
        self.db_name = db_name
        self.collection_name = collection_name

    def get_collection_url(self) -> str:
        """Get the base collection URL."""
        return f"https://api.onenode.ai/v0/project/{self.project_id}/db/{self.db_name}/collection/{self.collection_name}"

    def get_document_url(self) -> str:
        """Get the document URL for document operations."""
        return f"{self.get_collection_url()}/document"

    def get_headers(self) -> dict:
        """Get headers for requests."""
        return {"Authorization": f"Bearer {self.api_key}"}

    def __serialize(self, value):
        """Serialize BSON types, Text, and nested structures into JSON-compatible formats."""
        if value is None or isinstance(value, (bool, int, float, str)):
            return value

        if isinstance(value, dict):
            return {k: self.__serialize(v) for k, v in value.items()}

        if isinstance(value, list):
            return [self.__serialize(item) for item in value]

        if isinstance(value, Text):
            return value._serialize()
            
        if isinstance(value, Image):
            return value._serialize()

        serializer = BSON_SERIALIZERS.get(type(value))
        if serializer:
            return serializer(value)

        raise TypeError(f"Unsupported BSON type: {type(value)}")

    def __extract_binary_data(self, documents: list[dict]) -> dict:
        """Extract binary data from Image objects and return as files dict for multipart form."""
        files = {}
        
        def extract_from_value(value, doc_index: int, path: str = ""):
            if isinstance(value, Image) and value.has_binary_data():
                # Create field name following the pattern: doc_{index}.{field_path}.xImage.data
                field_name = f"doc_{doc_index}.{path}.xImage.data" if path else f"doc_{doc_index}.xImage.data"
                binary_data = value.get_binary_data()
                if binary_data:
                    files[field_name] = (field_name, binary_data, value.mime_type)
            elif isinstance(value, dict):
                for k, v in value.items():
                    new_path = f"{path}.{k}" if path else k
                    extract_from_value(v, doc_index, new_path)
            elif isinstance(value, list):
                for i, item in enumerate(value):
                    new_path = f"{path}.{i}" if path else str(i)
                    extract_from_value(item, doc_index, new_path)
        
        for doc_index, doc in enumerate(documents):
            extract_from_value(doc, doc_index)
        
        return files

    def __deserialize(self, value, depth=0):
        """Convert JSON-compatible structures back to BSON types and Text."""
        if isinstance(value, dict):
            # Check for special types first
            if "xText" in value:
                return Text._deserialize(value)
            if "xImage" in value:
                return Image._deserialize(value)
            
            # Check for BSON types
            for key in value:
                if key.startswith("$"):
                    if key == "$oid":
                        return ObjectId(value["$oid"])
                    if key == "$date":
                        return datetime.fromisoformat(value["$date"])
                    if key == "$numberDecimal":
                        return Decimal128(value["$numberDecimal"])
                    if key == "$binary":
                        return Binary(bytes.fromhex(value["$binary"]))
                    if key == "$regex":
                        return Regex(value["$regex"], value.get("$options", 0))
                    if key == "$code":
                        return Code(value["$code"])
                    if key == "$timestamp":
                        return Timestamp(
                            value["$timestamp"]["t"], value["$timestamp"]["i"]
                        )
                    if key == "$minKey":
                        return MinKey()
                    if key == "$maxKey":
                        return MaxKey()

            return {k: self.__deserialize(v, depth + 1) for k, v in value.items()}

        elif isinstance(value, list):
            return [self.__deserialize(item, depth + 1) for item in value]

        elif value is None:
            return None

        elif isinstance(value, (bool, int, float, str)):
            return value

        else:
            raise TypeError(
                f"Unsupported BSON type during deserialization: {type(value)}"
            )

    def handle_response(self, response):
        try:
            response.raise_for_status()
            json_response = response.json()
            return self.__deserialize(json_response)
        except requests.exceptions.HTTPError as e:
            try:
                error_data = response.json()
                status = error_data.get("status", "error")
                code = error_data.get("code", 500)
                message = error_data.get("message", "An unknown error occurred.")

                if code == 401:
                    raise AuthenticationError(code, message) from e
                elif code >= 400 and code < 500:
                    raise ClientRequestError(code, message) from e
                else:
                    raise ServerError(code, message) from e

            except ValueError:
                raise APIClientError(response.status_code, response.text) from e

    def insert(self, documents: list[dict]) -> InsertResponse:
        """Insert documents into the collection.
        
        Returns an InsertResponse object that supports attribute-style access:
        - response.inserted_ids - List of inserted document IDs
        """
        # Validate input
        if not isinstance(documents, list):
            raise ClientRequestError(
                400,
                f"'documents' must be a list of dictionaries, but got {type(documents).__name__}. "
                f"If you're trying to insert a single document, wrap it in a list: [document]"
            )
        
        if not documents:
            raise ClientRequestError(
                400,
                "Cannot insert empty list of documents. Provide at least one document."
            )
        
        for i, document in enumerate(documents):
            if not isinstance(document, dict):
                raise ClientRequestError(
                    400,
                    f"Invalid document at index {i}. Expected a dictionary, but received {type(document).__name__}. "
                    f"Each document must be a JSON object."
                )
        
        url = self.get_document_url()
        headers = self.get_headers()
        serialized_docs = [self.__serialize(doc) for doc in documents]
        
        # Extract binary data for multipart form
        files = self.__extract_binary_data(documents)
        data = {"documents": json.dumps(serialized_docs)}

        response = requests.post(url, headers=headers, files=files, data=data)
        response_data = self.handle_response(response)
        
        # Return InsertResponse for attribute-style access
        return InsertResponse(response_data)

    def update(self, filter: dict, update: dict, upsert: bool = False) -> dict:
        """Update documents matching filter."""
        url = self.get_document_url()
        headers = self.get_headers()
        transformed_filter = self.__serialize(filter)
        transformed_update = self.__serialize(update)
        
        # Extract binary data for multipart form (from update data)
        files = self.__extract_binary_data([update])
        data = {
            "filter": json.dumps(transformed_filter),
            "update": json.dumps(transformed_update),
            "upsert": str(upsert).lower(),
        }

        response = requests.put(url, headers=headers, files=files, data=data)
        return self.handle_response(response)

    def delete(self, filter: dict) -> dict:
        """Delete documents matching filter."""
        url = self.get_document_url()
        headers = self.get_headers()
        transformed_filter = self.__serialize(filter)
        
        data = {"filter": json.dumps(transformed_filter)}

        response = requests.delete(url, headers=headers, data=data)
        return self.handle_response(response)

    def find(
        self,
        filter: dict,
        projection: Projection | None = None,
        sort: dict = None,
        limit: int = None,
        skip: int = None,
    ) -> list[dict]:
        """Find documents matching filter.
        
        Args:
            filter: A query object to match documents (MongoDB-style filter syntax)
            projection: OneNode-style projection object to control returned fields.
                       Must be in format: {"mode": "include|exclude", "fields": ["field1", "field2"]}
                       Examples:
                       - {"mode": "include", "fields": ["name", "age"]} - Return only name and age
                       - {"mode": "exclude", "fields": ["password"]} - Return all except password
                       - {"mode": "include"} - Return entire document
                       - {"mode": "exclude"} - Return only _id field
            sort: Sort specification (e.g., {"age": -1} for descending by age)
            limit: Maximum number of documents to return
            skip: Number of documents to skip (for pagination)
            
        Returns:
            List of matching documents
            
        Example:
            # Find all users over 25, returning only name and email
            users = collection.find(
                {"age": {"$gt": 25}},
                projection={"mode": "include", "fields": ["name", "email"]},
                sort={"age": -1},
                limit=10
            )
        """
        url = f"{self.get_collection_url()}/document/find"
        headers = self.get_headers()
        transformed_filter = self.__serialize(filter)
        
        data = {"filter": json.dumps(transformed_filter)}
        
        if projection is not None:
            data["projection"] = json.dumps(projection)
        if sort is not None:
            data["sort"] = json.dumps(sort)
        if limit is not None:
            data["limit"] = str(limit)
        if skip is not None:
            data["skip"] = str(skip)

        response = requests.post(url, headers=headers, data=data)
        response_data = self.handle_response(response)
        
        return response_data

    def query(
        self,
        query: str,
        filter: dict = None,
        projection: Projection | None = None,
        emb_model: str = None,
        top_k: int = None,
        include_embedding: bool = None,
    ) -> list[QueryResponse]:
        """Perform semantic search on the collection.
        
        Args:
            query: Text query for semantic search
            filter: MongoDB-style filter to narrow search results (optional)
            projection: OneNode-style projection object to control returned fields.
                       Must be in format: {"mode": "include|exclude", "fields": ["field1", "field2"]}
                       Examples:
                       - {"mode": "include", "fields": ["title", "content"]} - Return only title and content
                       - {"mode": "exclude", "fields": ["metadata"]} - Return all except metadata
            emb_model: Embedding model to use (optional, defaults to "text-embedding-3-small")
            top_k: Maximum number of results to return (optional, defaults to 10)
            include_embedding: Whether to include embedding vectors in response (optional)
        
        Returns:
            List of QueryResponse objects that support attribute-style access:
            - match.chunk - Text chunk that matched the query
            - match.path - Document field path
            - match.chunk_n - Index of the chunk
            - match.score - Similarity score (0-1)  
            - match.document - Full document containing the match (regular dict)
            - match.embedding - Embedding vector embedding (optional, when include_embedding=True)
            
        Example:
            # Search for AI content, returning only title and summary
            results = collection.query(
                "artificial intelligence machine learning",
                projection={"mode": "include", "fields": ["title", "summary"]},
                top_k=5
            )
        """
        url = f"{self.get_collection_url()}/document/query"
        headers = self.get_headers()

        data = {"query": query}
        
        if filter is not None:
            data["filter"] = json.dumps(self.__serialize(filter))
        if projection is not None:
            data["projection"] = json.dumps(projection)
        if emb_model is not None:
            data["emb_model"] = emb_model
        if top_k is not None:
            data["top_k"] = str(top_k)
        if include_embedding is not None:
            data["include_embedding"] = str(include_embedding).lower()

        response = requests.post(url, headers=headers, data=data)
        response_data = self.handle_response(response)
        
        # The API returns a list of matches directly, not wrapped in an object
        if isinstance(response_data, list):
            matches = response_data
        else:
            # Fallback for backward compatibility
            matches = response_data.get("matches", [])
        
        # Convert each match to QueryResponse for attribute-style access
        return [QueryResponse(match) for match in matches]

    def drop(self) -> None:
        """Delete the entire collection."""
        url = self.get_collection_url()
        headers = self.get_headers()
        
        response = requests.delete(url, headers=headers)
        if response.status_code == 204:
            return None
            
        self.handle_response(response)
