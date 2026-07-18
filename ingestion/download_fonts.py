"""Download and locally cache font files, skipping re-download on re-run."""

from pathlib import Path

from tqdm import tqdm

from ingestion.catalog import load_catalog
from ingestion.config import CATALOG_PATH, FONTS_DIR
from ingestion.http import build_session, download_file
from ingestion.logging_setup import get_logger
from ingestion.models import FontFamily
from ingestion.util import slugify

logger = get_logger(__name__)


def font_variant_path(family: FontFamily, variant: str) -> Path:
    suffix = Path(family.variant_urls[variant]).suffix or ".ttf"
    return FONTS_DIR / family.slug / f"{slugify(variant)}{suffix}"


def download_family(family: FontFamily, session) -> dict[str, Path]:
    paths: dict[str, Path] = {}
    for variant, url in family.variant_urls.items():
        dest = font_variant_path(family, variant)
        try:
            paths[variant] = download_file(session, url, dest)
        except Exception:
            logger.warning("failed to download %s (%s)", family.name, variant, exc_info=True)
    return paths


def main() -> None:
    families = load_catalog(CATALOG_PATH)
    session = build_session()

    downloaded = 0
    for family in tqdm(families, desc="downloading fonts"):
        downloaded += len(download_family(family, session))

    logger.info("downloaded %d font files across %d families", downloaded, len(families))


if __name__ == "__main__":
    main()
