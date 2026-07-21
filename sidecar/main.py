"""Embedding sidecar: holds SigLIP in memory, exposes it over HTTP for the query API.

Run with: uvicorn sidecar.main:app --host 0.0.0.0 --port 8001
"""

from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from ingestion.detect_regions import detect_regions
from ingestion.embed import embed_pil_image, embed_text

app = FastAPI(title="typeseek embedding sidecar")


class TextEmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    vector: list[float]


class EmbedRegionsResponse(BaseModel):
    vectors: list[list[float]]


def _region_box(region: dict, width: int, height: int) -> tuple[int, int, int, int]:
    x = max(0.0, min(1.0, region.get("x", 0.0)))
    y = max(0.0, min(1.0, region.get("y", 0.0)))
    w = max(0.01, min(1.0 - x, region.get("width", 1.0)))
    h = max(0.01, min(1.0 - y, region.get("height", 1.0)))
    left = int(x * width)
    upper = int(y * height)
    right = max(left + 1, int((x + w) * width))
    lower = max(upper + 1, int((y + h) * height))
    return left, upper, right, lower


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


@app.post("/embed-image-regions", response_model=EmbedRegionsResponse)
async def embed_image_regions_endpoint(file: UploadFile = File(...)) -> EmbedRegionsResponse:
    data = await file.read()
    try:
        image = Image.open(BytesIO(data))
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="could not decode image")

    regions = detect_regions(image)

    if len(regions) == 1:
        vectors = [embed_pil_image(image)]
    else:
        width, height = image.size
        vectors = []
        for region in regions:
            box = _region_box(region, width, height)
            vectors.append(embed_pil_image(image.crop(box)))

    return EmbedRegionsResponse(vectors=[v.tolist() for v in vectors])


@app.post("/embed-text", response_model=EmbedResponse)
def embed_text_endpoint(payload: TextEmbedRequest) -> EmbedResponse:
    vector = embed_text(payload.text)
    return EmbedResponse(vector=vector.tolist())
