"""Persists the fetched font catalog to disk so later pipeline stages don't re-hit the API."""

import json
from pathlib import Path

from ingestion.models import FontFamily


def save_catalog(families: list[FontFamily], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps([family.to_dict() for family in families], indent=2))


def load_catalog(path: Path) -> list[FontFamily]:
    if not path.exists():
        raise FileNotFoundError(f"no catalog at {path}; run `python -m ingestion.fetch_fonts` first")
    data = json.loads(path.read_text())
    return [FontFamily.from_dict(item) for item in data]
