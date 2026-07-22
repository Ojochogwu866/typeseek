from ingestion.models import FontFamily


def _family(name="Abril Fatface", variant_urls=None) -> FontFamily:
    return FontFamily(
        name=name,
        source="google-fonts",
        source_url="https://fonts.google.com/specimen/Abril+Fatface",
        category="display",
        license="commercial-ok",
        variant_urls=variant_urls or {"regular": "https://example.com/regular.ttf"},
    )


def test_slug_combines_source_and_name():
    family = _family(name="Abril Fatface")
    assert family.slug == "google-fonts-abril-fatface"


def test_slug_strips_non_alphanumeric():
    family = _family(name="M PLUS 1p")
    assert family.slug == "google-fonts-m-plus-1p"


def test_primary_variant_prefers_regular():
    family = _family(variant_urls={"700": "url", "regular": "url", "italic": "url"})
    assert family.primary_variant == "regular"


def test_primary_variant_falls_back_to_alphabetical_first():
    family = _family(variant_urls={"700": "url", "300": "url"})
    assert family.primary_variant == "300"


def test_upright_weights_excludes_italics_and_sorts_light_to_heavy():
    family = _family(
        variant_urls={
            "700": "url",
            "regular": "url",
            "300": "url",
            "italic": "url",
            "700italic": "url",
        }
    )
    assert family.upright_weights == ["300", "regular", "700"]


def test_upright_weights_empty_when_only_italics():
    family = _family(variant_urls={"italic": "url", "700italic": "url"})
    assert family.upright_weights == []
