"""Embed a local image and print the top-k nearest fonts in the index."""

import argparse
from pathlib import Path

from ingestion.db.loader import get_connection
from ingestion.embed import embed_image

TOP_K_DEFAULT = 10


def top_matches(image_path: Path, k: int = TOP_K_DEFAULT) -> list[tuple[str, float]]:
    vector = embed_image(image_path)
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT fonts.name, embeddings.vec <=> %s AS distance
        FROM embeddings
        JOIN fonts ON fonts.id = embeddings.font_id
        ORDER BY distance
        LIMIT %s
        """,
        (vector, k),
    ).fetchall()
    return [(name, 1 - distance) for name, distance in rows]


def main() -> None:
    parser = argparse.ArgumentParser(description="Find the nearest indexed fonts to a local image.")
    parser.add_argument("image_path", type=Path)
    parser.add_argument("-k", type=int, default=TOP_K_DEFAULT)
    args = parser.parse_args()

    for rank, (name, score) in enumerate(top_matches(args.image_path, args.k), start=1):
        print(f"{rank:>2}. {name} ({score:.3f})")


if __name__ == "__main__":
    main()
