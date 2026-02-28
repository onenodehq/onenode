import os
import requests
from onenode._database import Database


class OneNode:
    """Client for interacting with OneNode.
    
    Requires ONENODE_PROJECT_ID and ONENODE_API_KEY environment variables.
    """
    
    def __init__(self):
        """Initialize OneNode client from environment variables."""
        self.project_id = os.getenv("ONENODE_PROJECT_ID", "")
        self.api_key = os.getenv("ONENODE_API_KEY", "")

        if not self.api_key:
            raise ValueError(
                "Missing API Key: Please set the ONENODE_API_KEY environment variable. "
                "Tip: Ensure your environment file (e.g., .env) is loaded."
            )
            
        if not self.project_id:
            raise ValueError(
                "Missing Project ID: Please set the ONENODE_PROJECT_ID environment variable. "
                "Tip: Ensure your environment file (e.g., .env) is loaded."
            )

        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})

    def db(self, db_name: str) -> Database:
        """Get database by name."""
        return Database(self.api_key, self.project_id, db_name)

    def __getattr__(self, name):
        """Allow db access via attribute: client.my_database"""
        return self.db(name)

    def __getitem__(self, name):
        """Allow db access via dictionary: client["my_database"]"""
        return self.db(name)
