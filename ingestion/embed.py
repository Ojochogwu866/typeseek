"""Embed specimen images with SigLIP, one vector per font (mean-pooled specimens).

Requires the `embed` extra (torch + open_clip_torch): pip install -e ".[embed]"
Heavy imports are deferred into functions so the base install stays light for stages
that don't need them.
"""

from functools import lru_cache
from pathlib import Path

import numpy as np
from tqdm import tqdm

from ingestion.catalog import load_catalog
from ingestion.config import CATALOG_PATH, EMBEDDING_DIM, EMBEDDING_MODEL, EMBEDDING_PRETRAINED, EMBEDDINGS_DIR
from ingestion.logging_setup import get_logger
from ingestion.render_specimens import list_specimens

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def _load_model():
    import open_clip
    import torch

    model, _, preprocess = open_clip.create_model_and_transforms(EMBEDDING_MODEL, pretrained=EMBEDDING_PRETRAINED)
    model.eval()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    return model.to(device), preprocess, device


@lru_cache(maxsize=1)
def _load_tokenizer():
    import open_clip

    return open_clip.get_tokenizer(EMBEDDING_MODEL)


def _normalized(vector: "np.ndarray") -> np.ndarray:
    assert vector.shape[0] == EMBEDDING_DIM, f"unexpected embedding dim {vector.shape[0]}"
    return vector


def embed_pil_image(image) -> np.ndarray:
    """Embed an already-loaded PIL image (in-memory, no filesystem round trip)."""
    import torch

    model, preprocess, device = _load_model()
    tensor = preprocess(image.convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        features = model.encode_image(tensor)
        features /= features.norm(dim=-1, keepdim=True)

    return _normalized(features.squeeze(0).cpu().numpy())


def embed_image(path: Path) -> np.ndarray:
    from PIL import Image

    return embed_pil_image(Image.open(path))


def embed_text(text: str) -> np.ndarray:
    import torch

    model, _, device = _load_model()
    tokenizer = _load_tokenizer()
    tokens = tokenizer([text]).to(device)

    with torch.no_grad():
        features = model.encode_text(tokens)
        features /= features.norm(dim=-1, keepdim=True)

    return _normalized(features.squeeze(0).cpu().numpy())


def embed_family(specimen_paths: list[Path]) -> np.ndarray:
    """Mean-pool per-specimen embeddings into a single vector for the font."""
    vectors = np.stack([embed_image(path) for path in specimen_paths])
    mean = vectors.mean(axis=0)
    return mean / np.linalg.norm(mean)


def main() -> None:
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    families = load_catalog(CATALOG_PATH)

    embedded = skipped = 0
    for family in tqdm(families, desc="embedding fonts"):
        specimen_paths = list_specimens(family)
        if not specimen_paths:
            skipped += 1
            continue
        vector = embed_family(specimen_paths)
        np.save(EMBEDDINGS_DIR / f"{family.slug}.npy", vector)
        embedded += 1

    logger.info("embedded %d families, skipped %d (no specimens)", embedded, skipped)


if __name__ == "__main__":
    main()
