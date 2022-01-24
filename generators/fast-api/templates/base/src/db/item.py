from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import UUID

from .base_model import BaseModel

class Item(BaseModel):
    name = Column(Text(), nullable=False)
