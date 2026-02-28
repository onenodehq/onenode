from onenode._collection import Collection

class Database:
    """Database in OneNode."""
    
    def __init__(self, api_key: str, project_id: str, db_name: str):
        """Initialize database instance."""
        self.api_key = api_key
        self.project_id = project_id
        self.db_name = db_name

    def collection(self, collection_name: str) -> Collection:
        """Get collection by name."""
        return Collection(self.api_key, self.project_id, self.db_name, collection_name)

    def __getattr__(self, name: str) -> Collection:
        """Allow collection access via attribute: db.my_collection"""
        return self.collection(name)

    def __getitem__(self, name: str) -> Collection:
        """Allow collection access via dictionary: db["my_collection"]"""
        return self.collection(name)
