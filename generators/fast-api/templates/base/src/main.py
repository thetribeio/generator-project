from typing import Optional

from fastapi import FastAPI

from src.api import example_controller

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(
    example_controller.router,
    prefix="/api/example",
    tags=["Example"],
)
