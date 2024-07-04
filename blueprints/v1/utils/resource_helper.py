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


from datetime import datetime, timedelta, timezone
import urllib.parse

def is_s3_url_expired(signed_url: str, latency_seconds=10):
    # Parse the signed URL
    parsed_url = urllib.parse.urlparse(signed_url)
    query_params = urllib.parse.parse_qs(parsed_url.query)

    # Extract the signing timestamp (in ISO 8601 format) and expiration duration (in seconds)
    amz_date = query_params.get("X-Amz-Date")
    expires = query_params.get("X-Amz-Expires")

    if amz_date is None or expires is None:
        raise ValueError("The URL does not contain the necessary parameters.")

    # Convert the signing timestamp to a datetime object
    signing_time = datetime.strptime(amz_date[0], "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)

    # Calculate the expiration time by adding the expiration duration to the signing time
    expiration_time = signing_time + timedelta(seconds=int(expires[0]))

    # Get the current time in UTC
    current_time = datetime.now(tz=timezone.utc)

    # Check if the current time is past the expiration time plus latency
    expired = current_time > expiration_time + timedelta(seconds=latency_seconds)

    return expired

