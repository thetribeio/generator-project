"""
Example controller
"""
from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.db import Item
from src.db.crud import CRUDItem
from .model import (
    ItemCreateBody,
    ItemResponse,
)
from src.db.db import get_db

router = APIRouter()


@router.get("/{item_id}", status_code=HTTPStatus.OK, tags=["Item"], response_model=ItemResponse)
async def get_item(item_id: UUID, db: Session = Depends(get_db)):
    item = CRUDItem(Item).get(item_id, db)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemResponse(
        id=item.id,
        name=item.name,
    )

@router.post("/", status_code=HTTPStatus.CREATED, tags=["Item"], response_model=ItemResponse)
async def create_item(body: ItemCreateBody, db: Session = Depends(get_db)):
    item = CRUDItem(Item).create({ "name": body.name }, db)
    db.refresh(item)

    return ItemResponse(
        id=item.id,
        name=item.name,
    )
