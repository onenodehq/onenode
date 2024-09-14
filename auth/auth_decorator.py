from flask import g, request, jsonify
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from jose import jwe
import json
import os
from functools import wraps


# Helper function to decode the NextAuth session
def decode_nextauth_session(token):
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"",
        info=b"NextAuth.js Generated Encryption Key",
    )

    key = hkdf.derive(os.environ.get("NEXTAUTH_SECRET", "").encode("utf-8"))
    data = jwe.decrypt(token, key)
    token_data = json.loads(data.decode("utf-8"))
    return token_data


# JWT Validation Decorator
def requires_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            # Assuming the token is passed as 'Bearer <token>'
            token = auth_header.split(" ")[1]
            decoded_token = decode_nextauth_session(token)
            g.onenode_id = decoded_token["user"]["_id"]
        except Exception as e:
            print(f"Error decoding token: {e}")
            return jsonify({"message": "Token is invalid or expired!"}), 401

        # If the token is valid, proceed to the next function
        return f(*args, **kwargs)

    return decorated_function


# source (modified): https://www.reddit.com/r/nextjs/comments/1dq537p/handling_authjs_jwts_on_external_server/
