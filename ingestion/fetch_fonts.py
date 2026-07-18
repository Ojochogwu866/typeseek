"""Fetch the full Google Fonts family list: download URLs and category metadata."""

from ingestion.catalog import save_catalog
from ingestion.config import CATALOG_PATH, GOOGLE_FONTS_API_KEY, GOOGLE_FONTS_LICENSE
from ingestion.http import build_session
from ingestion.logging_setup import get_logger
from ingestion.models import FontFamily

logger = get_logger(__name__)

GOOGLE_FONTS_API_URL = "https://www.googleapis.com/webfonts/v1/webfonts"
SOURCE = "google-fonts"


def fetch_font_list() -> list[FontFamily]:
    if not GOOGLE_FONTS_API_KEY:
        raise RuntimeError(
            "GOOGLE_FONTS_API_KEY is not set; copy .env.example to .env and fill it in"
        )

    session = build_session()
    response = session.get(
        GOOGLE_FONTS_API_URL,
        params={"key": GOOGLE_FONTS_API_KEY, "sort": "alpha"},
        timeout=30,
    )
    response.raise_for_status()

    families = [_to_font_family(item) for item in response.json()["items"]]
    logger.info("fetched %d font families", len(families))
    return families


def _to_font_family(item: dict) -> FontFamily:
    name = item["family"]
    return FontFamily(
        name=name,
        source=SOURCE,
        source_url=f"https://fonts.google.com/specimen/{name.replace(' ', '+')}",
        category=item.get("category", "unknown"),
        license=GOOGLE_FONTS_LICENSE,
        variant_urls=item["files"],
    )


def main() -> None:
    families = fetch_font_list()
    save_catalog(families, CATALOG_PATH)
    logger.info("wrote catalog to %s", CATALOG_PATH)


if __name__ == "__main__":
    main()
