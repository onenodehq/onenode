import re
import urllib.parse
from datetime import datetime, timedelta, timezone


def to_snake_case(s):
    """Convert a string to snake_case."""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower().replace("-", "_")


def convert_keys_to_snake_case(d):
    """Convert all keys in a dictionary to snake_case recursively."""
    if not isinstance(d, dict):
        return d
    new_dict = {}
    for k, v in d.items():
        new_key = to_snake_case(k)
        if isinstance(v, dict):
            new_dict[new_key] = convert_keys_to_snake_case(v)
        else:
            new_dict[new_key] = v
    return new_dict


def is_signed_url_expired(signed_url: str, latency_seconds=10):
    # Parse the signed URL
    parsed_url = urllib.parse.urlparse(signed_url)
    query_params = urllib.parse.parse_qs(parsed_url.query)

    # Extract the expiration time directly from the URL
    expires = query_params.get("Expires")

    if expires is None:
        raise ValueError("The URL does not contain the necessary expiration parameter.")

    # Convert the expiration time to a datetime object (assume Unix timestamp)
    expiration_time = datetime.fromtimestamp(int(expires[0]), tz=timezone.utc)

    # Get the current time in UTC
    current_time = datetime.now(tz=timezone.utc)

    # Check if the current time is past the expiration time plus latency
    expired = current_time + timedelta(seconds=latency_seconds) > expiration_time

    return expired
