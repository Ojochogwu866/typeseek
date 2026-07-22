import base64
from io import BytesIO

from PIL import Image

from sidecar.main import THUMBNAIL_MAX_DIMENSION, _region_box, _thumbnail_base64


def test_region_box_normal_fraction():
    box = _region_box({"x": 0.25, "y": 0.5, "width": 0.5, "height": 0.25}, 400, 200)
    assert box == (100, 100, 300, 150)


def test_region_box_clamps_out_of_range_fractions():
    left, upper, right, lower = _region_box({"x": -0.5, "y": -0.5, "width": 3.0, "height": 3.0}, 400, 200)
    assert 0 <= left < right <= 400
    assert 0 <= upper < lower <= 200


def test_region_box_never_produces_zero_size_box():
    left, upper, right, lower = _region_box({"x": 1.0, "y": 1.0, "width": 0.0, "height": 0.0}, 400, 200)
    assert right > left
    assert lower > upper


def test_region_box_missing_keys_defaults_to_whole_image():
    box = _region_box({}, 400, 200)
    assert box == (0, 0, 400, 200)


def test_thumbnail_base64_produces_decodable_bounded_jpeg():
    image = Image.new("RGB", (1000, 500), "blue")
    encoded = _thumbnail_base64(image)

    decoded = Image.open(BytesIO(base64.standard_b64decode(encoded)))
    assert decoded.format == "JPEG"
    assert max(decoded.size) <= THUMBNAIL_MAX_DIMENSION
