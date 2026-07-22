from unittest.mock import MagicMock, patch

from PIL import Image

import ingestion.detect_regions as detect_regions_module
from ingestion.detect_regions import WHOLE_IMAGE_REGION, _strip_code_fence, detect_regions


def test_strip_code_fence_removes_json_fence():
    text = '```json\n{"regions": []}\n```'
    assert _strip_code_fence(text) == '{"regions": []}'


def test_strip_code_fence_removes_bare_fence():
    text = '```\n{"regions": []}\n```'
    assert _strip_code_fence(text) == '{"regions": []}'


def test_strip_code_fence_leaves_unfenced_json_alone():
    text = '{"regions": []}'
    assert _strip_code_fence(text) == '{"regions": []}'


def _tiny_image() -> Image.Image:
    return Image.new("RGB", (10, 10), "white")


def test_detect_regions_no_api_key_returns_whole_image(monkeypatch):
    monkeypatch.setattr(detect_regions_module, "ANTHROPIC_API_KEY", "")
    assert detect_regions(_tiny_image()) == WHOLE_IMAGE_REGION


def test_detect_regions_falls_back_when_client_raises(monkeypatch):
    monkeypatch.setattr(detect_regions_module, "ANTHROPIC_API_KEY", "fake-key")
    with patch("anthropic.Anthropic", side_effect=RuntimeError("boom")):
        assert detect_regions(_tiny_image()) == WHOLE_IMAGE_REGION


def test_detect_regions_falls_back_on_malformed_json(monkeypatch):
    monkeypatch.setattr(detect_regions_module, "ANTHROPIC_API_KEY", "fake-key")
    fake_response = MagicMock()
    fake_response.content = [MagicMock(text="not valid json at all")]
    fake_client = MagicMock()
    fake_client.messages.create.return_value = fake_response
    with patch("anthropic.Anthropic", return_value=fake_client):
        assert detect_regions(_tiny_image()) == WHOLE_IMAGE_REGION


def test_detect_regions_returns_parsed_regions(monkeypatch):
    monkeypatch.setattr(detect_regions_module, "ANTHROPIC_API_KEY", "fake-key")
    expected = [{"x": 0.0, "y": 0.0, "width": 0.5, "height": 1.0}]
    fake_response = MagicMock()
    fake_response.content = [MagicMock(text='{"regions": [{"x": 0.0, "y": 0.0, "width": 0.5, "height": 1.0}]}')]
    fake_client = MagicMock()
    fake_client.messages.create.return_value = fake_response
    with patch("anthropic.Anthropic", return_value=fake_client):
        assert detect_regions(_tiny_image()) == expected


def test_detect_regions_empty_regions_list_falls_back(monkeypatch):
    monkeypatch.setattr(detect_regions_module, "ANTHROPIC_API_KEY", "fake-key")
    fake_response = MagicMock()
    fake_response.content = [MagicMock(text='{"regions": []}')]
    fake_client = MagicMock()
    fake_client.messages.create.return_value = fake_response
    with patch("anthropic.Anthropic", return_value=fake_client):
        assert detect_regions(_tiny_image()) == WHOLE_IMAGE_REGION
