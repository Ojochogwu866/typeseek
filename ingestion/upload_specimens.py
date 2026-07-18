"""Upload specimen PNGs to R2/S3 and return their public URLs.

Requires the `storage` extra (boto3): pip install -e ".[storage]"
"""

from functools import lru_cache
from pathlib import Path

from tqdm import tqdm

from ingestion.catalog import load_catalog
from ingestion.config import CATALOG_PATH, R2_ACCESS_KEY_ID, R2_BUCKET, R2_ENDPOINT_URL, R2_SECRET_ACCESS_KEY
from ingestion.logging_setup import get_logger
from ingestion.render_specimens import list_specimens

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def _client():
    import boto3

    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    )


def _exists(key: str) -> bool:
    from botocore.exceptions import ClientError

    try:
        _client().head_object(Bucket=R2_BUCKET, Key=key)
        return True
    except ClientError:
        return False


def upload_specimen(local_path: Path, key: str, *, overwrite: bool = False) -> str:
    if overwrite or not _exists(key):
        _client().upload_file(str(local_path), R2_BUCKET, key)
    return f"{R2_ENDPOINT_URL}/{R2_BUCKET}/{key}"


def main() -> None:
    families = load_catalog(CATALOG_PATH)

    uploaded = 0
    for family in tqdm(families, desc="uploading specimens"):
        for path in list_specimens(family):
            upload_specimen(path, key=f"specimens/{family.slug}/{path.name}")
            uploaded += 1

    logger.info("uploaded %d specimen images", uploaded)


if __name__ == "__main__":
    main()
