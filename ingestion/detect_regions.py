"""Detect distinct lettering/font regions in a user-uploaded image, at query time.

Best-effort: any failure (API error, malformed response) falls back to treating the
whole image as a single region, so image search can never fail because of this step.
"""

import base64
import json
import re
from io import BytesIO

from ingestion.config import ANTHROPIC_API_KEY, ENRICHMENT_MODEL
from ingestion.logging_setup import get_logger

logger = get_logger(__name__)

WHOLE_IMAGE_REGION = [{"x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0}]

# Claude sometimes wraps JSON in a markdown code fence despite being told not to.
_CODE_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _strip_code_fence(text: str) -> str:
    return _CODE_FENCE.sub("", text.strip()).strip()

PROMPT = (
    "Look at this image. Identify each visually distinct font or lettering style present "
    "(for example a headline in one typeface and body text in another). For each distinct "
    "style, return a bounding box tightly cropping a representative sample of that "
    "lettering, as fractions of the image's width/height (0.0 to 1.0). If the image "
    "contains only one font style, return exactly one region covering that lettering. "
    "Reply with ONLY strict JSON, no other text, in this exact shape: "
    '{"regions": [{"x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0}]}'
)


def detect_regions(image) -> list[dict]:
    """image is a PIL.Image. Always returns at least one region."""
    if not ANTHROPIC_API_KEY:
        return WHOLE_IMAGE_REGION

    try:
        import anthropic

        buf = BytesIO()
        image.convert("RGB").save(buf, format="PNG")
        image_data = base64.standard_b64encode(buf.getvalue()).decode("ascii")

        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        response = client.messages.create(
            model=ENRICHMENT_MODEL,
            max_tokens=500,
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
        parsed = json.loads(_strip_code_fence(response.content[0].text))
        regions = parsed["regions"]
        if not regions:
            return WHOLE_IMAGE_REGION
        return regions
    except Exception:
        logger.warning("region detection failed, falling back to whole image", exc_info=True)
        return WHOLE_IMAGE_REGION
