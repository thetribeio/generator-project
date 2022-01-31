"""
Utils function
"""
import re

def convert_string_to_snake_case(string: str) -> str:
    """
    Converts a string to snake_case.
    Args:
        string (str): The string to be converted.

    Returns:
        str: The string in snake_case
    """
    FIRST_CAP_RE = re.compile("(.)([A-Z][a-z]+)")
    ALL_CAP_RE = re.compile("([a-z0-9])([A-Z])")
    interm_name = FIRST_CAP_RE.sub(r"\1_\2", string)
    return ALL_CAP_RE.sub(r"\1_\2", interm_name).lower()
