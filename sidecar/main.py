"""Embedding sidecar: holds SigLIP in memory, exposes it over HTTP for the query API.

Run with: uvicorn sidecar.main:app --host 0.0.0.0 --port 8001
"""

from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from ingestion.embed import embed_pil_image, embed_text

app = FastAPI(title="typeseek embedding sidecar")


class TextEmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    vector: list[float]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/embed-image", response_model=EmbedResponse)
async def embed_image_endpoint(file: UploadFile = File(...)) -> EmbedResponse:
    data = await file.read()
    try:
        image = Image.open(BytesIO(data))
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="could not decode image")

    vector = embed_pil_image(image)
    return EmbedResponse(vector=vector.tolist())


@app.post("/embed-text", response_model=EmbedResponse)
def embed_text_endpoint(payload: TextEmbedRequest) -> EmbedResponse:
    vector = embed_text(payload.text)
    return EmbedResponse(vector=vector.tolist())
