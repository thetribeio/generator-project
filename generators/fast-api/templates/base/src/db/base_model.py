from typing import Any
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import TIMESTAMP, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func

from src.utils import convert_string_to_snake_case

Base = declarative_base()

class BaseModel(Base):
    """Abstract base model for entities, with an uuid, and created_at and updated_at timestamps"""

    @declared_attr
    def __tablename__(self) -> Any:
        return convert_string_to_snake_case(self.__name__) 

    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False)
    created_at = Column(TIMESTAMP(), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(), nullable=False, onupdate=func.now(), server_default=func.now())
