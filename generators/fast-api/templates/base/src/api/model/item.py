"""
Api classes for the device instance routes
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from .camel_model import CamelModel


class ItemCreateBody(CamelModel):
    name: str

class ItemResponse(CamelModel):
    id: UUID
    name: str
