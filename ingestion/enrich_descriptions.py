"""Tag each font specimen with searchable style vocabulary using a vision LLM, offline.

Powers the text-search leg (F2): full-text search over these tags, alongside the font's
name/category, is what lets a query like "bold rounded playful" surface fonts that were
never named anything close to that.
"""

import base64
from pathlib import Path

from tqdm import tqdm

from ingestion.catalog import load_catalog
from ingestion.config import ANTHROPIC_API_KEY, CATALOG_PATH, ENRICHMENT_MODEL, TAGS_DIR
from ingestion.logging_setup import get_logger
from ingestion.models import FontFamily
from ingestion.render_specimens import list_specimens

logger = get_logger(__name__)

PROMPT = (
    "Look at this font specimen. List 5-8 comma-separated words or short phrases describing "
    "its visual style, the way a designer searching for this look would type them "
    "(e.g. bold, rounded, geometric, playful, elegant, hand-drawn, condensed, futuristic, "
    "serif, script, tight spacing). Reply with ONLY the comma-separated list, nothing else."
)


def tags_path(family: FontFamily) -> Path:
    return TAGS_DIR / f"{family.slug}.txt"


def pick_specimen(family: FontFamily) -> Path | None:
    """Prefer the pangram (more letterforms, more informative for style) over the bare glyph."""
    specimens = {path.stem: path for path in list_specimens(family)}
    return specimens.get("pangram") or specimens.get("glyph") or next(iter(specimens.values()), None)


def tag_family(client, family: FontFamily) -> str | None:
    # client is an anthropic.Anthropic instance; left untyped since the SDK is lazily
    # imported in main() to keep the base install light.
    specimen = pick_specimen(family)
    if specimen is None:
        return None

    image_data = base64.standard_b64encode(specimen.read_bytes()).decode("ascii")
    response = client.messages.create(
        model=ENRICHMENT_MODEL,
        max_tokens=100,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
                    {"type": "text", "text": PROMPT},
                ],
            }
        ],
    )
    return response.content[0].text.strip()


def main() -> None:
    import anthropic

    if not ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY is not set; copy .env.example to .env and fill it in")

    TAGS_DIR.mkdir(parents=True, exist_ok=True)
    families = load_catalog(CATALOG_PATH)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    tagged = skipped = failed = 0
    for family in tqdm(families, desc="enriching descriptions"):
        dest = tags_path(family)
        if dest.exists():
            tagged += 1
            continue

        try:
            tags = tag_family(client, family)
        except Exception:
            logger.warning("failed to tag %s", family.name, exc_info=True)
            failed += 1
            continue

        if tags is None:
            skipped += 1
            continue

        dest.write_text(tags)
        tagged += 1

    logger.info("tagged %d families, skipped %d (no specimen), failed %d", tagged, skipped, failed)


if __name__ == "__main__":
    main()
