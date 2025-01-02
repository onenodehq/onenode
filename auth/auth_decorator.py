from flask import g, request
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from jose import jwe
import json
import os
from functools import wraps
from errors import AuthError


# Helper function to decode the NextAuth session
def decode_nextauth_session(token):
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=64,
        salt=b"__Secure-authjs.session-token",
        info=b"Auth.js Generated Encryption Key (__Secure-authjs.session-token)",
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
            raise AuthError("Token is missing!")

        try:
            # Assuming the token is passed as 'Bearer <token>'
            token = auth_header.split(" ")[1]
            decoded_token = decode_nextauth_session(token)
            g.user_id = decoded_token["user"]["_id"]
            g.email = decoded_token["user"]["email"]
            g.given_name = decoded_token["user"].get("given_name", "")
            g.family_name = decoded_token["user"].get("family_name", "")
        except Exception as e:
            raise AuthError("Token is invalid or expired!")
        # If the token is valid, proceed to the next function
        return f(*args, **kwargs)

    return decorated_function


def requires_onenode_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            raise AuthError("Token is missing!")

        try:
            # Assuming the token is passed as 'Bearer <token>'
            token = auth_header.split(" ")[1]
            decoded_token = decode_nextauth_session(token)
            g.user_id = decoded_token["user"]["_id"]
            g.email = decoded_token["user"]["email"]
        except Exception as e:
            raise AuthError("Token is invalid or expired!")
        # If the token is valid, proceed to the next function
        return f(*args, **kwargs)

    return decorated_function


# source (modified): https://www.reddit.com/r/nextjs/comments/1dq537p/handling_authjs_jwts_on_external_server/
