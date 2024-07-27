from functools import wraps
from flask import request, jsonify, g
from jose import jwt
import requests
import os

AUTH0_DOMAIN = os.environ['AUTH0_DOMAIN']
ALGORITHMS = ["RS256"]
AUTH0_AUDIENCE = os.environ['AUTH0_AUDIENCE']

def get_token_auth_header():
    """Obtains the Access Token from the Authorization Header"""
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise Exception("Authorization header is missing")

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise Exception("Authorization header must start with Bearer")
    elif len(parts) == 1:
        raise Exception("Token not found")
    elif len(parts) > 2:
        raise Exception("Authorization header must be Bearer token")

    token = parts[1]
    return token

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        jsonurl = requests.get(f'https://{AUTH0_DOMAIN}/.well-known/jwks.json').json()
        jwks = jsonurl['keys']
        try:
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            for key in jwks:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'],
                        'kid': key['kid'],
                        'use': key['use'],
                        'n': key['n'],
                        'e': key['e']
                    }
            if rsa_key:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=ALGORITHMS,
                    audience=AUTH0_AUDIENCE,
                    issuer=f'https://{AUTH0_DOMAIN}/'
                )
                g.user = payload  # Use Flask's global object `g` to store user data
                return f(*args, **kwargs)
            else:
                raise Exception("Unable to find appropriate key")
        except Exception as e:
            return jsonify({"message": str(e)}), 401
    return decorated

