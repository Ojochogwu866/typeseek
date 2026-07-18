"""Shared HTTP session (with retry/backoff) reused by every stage that fetches from the network."""

from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry


def build_session(retries: int = 3, backoff_factor: float = 0.5) -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=retries,
        backoff_factor=backoff_factor,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET", "HEAD"),
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def download_file(session: requests.Session, url: str, dest: Path, *, overwrite: bool = False) -> Path:
    """Download `url` to `dest`, skipping the request entirely if `dest` already exists."""
    if dest.exists() and dest.stat().st_size > 0 and not overwrite:
        return dest

    dest.parent.mkdir(parents=True, exist_ok=True)
    response = session.get(url, timeout=30)
    response.raise_for_status()

    tmp = dest.with_name(dest.name + ".part")
    tmp.write_bytes(response.content)
    tmp.replace(dest)
    return dest
