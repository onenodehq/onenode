#!/usr/bin/env python3
"""
Utility script to generate an API key and its hash value.
This follows the same implementation as the application to ensure compatibility.

To use:
    python3 utils/api_key_utils.py

Or, to run directly from terminal:
    ./utils/api_key_utils.py
"""

import hashlib
import os
import secrets
import string
from dotenv import load_dotenv

# Load .env file if exists
load_dotenv()

def generate_api_key(length=None):
    if length is None:
        # Use the same length as in the application
        length = int(os.getenv("CAPYDB_API_KEY_LENGTH", 48))
    
    alphabet = string.ascii_letters + string.digits
    api_key = "".join(secrets.choice(alphabet) for _ in range(length))
    return api_key

def hash_api_key(api_key):
    hash_object = hashlib.sha256()
    hash_object.update(api_key.encode("utf-8"))
    hashed_api_key = hash_object.hexdigest()
    return hashed_api_key

if __name__ == "__main__":
    api_key = generate_api_key()
    hashed_api_key = hash_api_key(api_key)
    
    print("Generated API key and hash value that match application implementation:")
    print(f"API Key:       {api_key}")
    print(f"Hashed Key:    {hashed_api_key}")
    print("\nThis key can be directly used with the application.")
    print("For security reasons, please store your API key securely and don't share it.") 