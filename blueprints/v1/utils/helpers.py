import re

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
