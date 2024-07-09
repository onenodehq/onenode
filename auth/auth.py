import jwt
import os
from flask import request, jsonify
from functools import wraps
import requests
import json

# Your AWS Cognito User Pool:
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_AWS_REGION = os.getenv("AWS_REGION")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
COGNITO_PUBLIC_KEYS = {}  # You need to fetch and cache the public keys from AWS

COGNITO_JWKS_URL = f"https://cognito-idp.{COGNITO_AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"

# Initialize the JWK client
jwks_client = jwt.PyJWKClient(COGNITO_JWKS_URL)


def get_public_keys():
    url = COGNITO_JWKS_URL
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises HTTPError for bad HTTP responses
        jwks = response.json()
        keys = jwks.get("keys", [])

        public_keys = {}
        for key in keys:
            kid = key["kid"]
            public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))

        if not public_keys:
            raise ValueError("No public keys found in JWKS endpoint.")

        return public_keys

    except requests.exceptions.RequestException as e:
        # Handle connection-related exceptions
        raise ConnectionError(f"Failed to connect to Cognito JWKS endpoint: {e}")

    except ValueError as e:
        # Handle other exceptions such as JSON errors or JWT decoding issues
        raise RuntimeError(f"Failed to process public keys from Cognito: {e}")


# Fetch and cache the public keys at startup
COGNITO_PUBLIC_KEYS = get_public_keys()


def verify_jwt(token):
    try:
        # Decode the header to get the kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid or kid not in COGNITO_PUBLIC_KEYS:
            raise jwt.InvalidTokenError("Invalid key ID")

        # Get the public key for the kid
        public_key = COGNITO_PUBLIC_KEYS[kid]
        # Decode the token
        decoded = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            audience=COGNITO_APP_CLIENT_ID,
        )
        return decoded
    except jwt.ExpiredSignatureError as e:
        return None  # or raise exception, or handle as you wish
    except jwt.InvalidTokenError as e:
        return None  # or raise exception, or handle as you wish


def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not "Authorization" in request.headers:
            return jsonify(message="Authorization header is missing"), 403
        token = request.headers["Authorization"].split(None, 1)[1].strip()
        decoded_token = verify_jwt(token)
        if decoded_token is None:
            return jsonify(message="Invalid or expired token"), 401
        # Extract custom user ID from the token
        user_id = decoded_token.get("custom:userId")
        if not user_id:
            return jsonify(message="Custom user ID not found in token"), 400
        # Pass the custom user ID to the decorated function
        return f(user_id, *args, **kwargs)

    return decorated_function
