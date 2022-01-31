"""
Base class for API models using alias generator to camel case
"""

from humps import camelize
from pydantic import BaseModel


def _to_camel(string):
    """Get string in camel case"""
    return camelize(string)


class CamelModel(BaseModel):
    """Base class for body and response classes"""

    class Config:  # pylint: disable=too-few-public-methods
        """Subclass to be configured"""

        alias_generator = _to_camel
        allow_population_by_field_name = True
