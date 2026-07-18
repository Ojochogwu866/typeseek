"""Shared data model for a font family as it moves through the ingestion pipeline.

Every stage (download, render, embed, load, upload) derives its file paths from
`FontFamily.slug` and `FontFamily.primary_variant`, so path-naming logic lives in
exactly one place instead of being re-derived per stage.
"""

from dataclasses import asdict, dataclass

from ingestion.util import slugify

_WEIGHT_ORDER = {
    "100": 100, "200": 200, "300": 300, "regular": 400, "400": 400,
    "500": 500, "600": 600, "700": 700, "800": 800, "900": 900,
}


@dataclass(frozen=True, slots=True)
class FontFamily:
    name: str
    source: str
    source_url: str
    category: str
    license: str
    variant_urls: dict[str, str]

    @property
    def slug(self) -> str:
        return slugify(f"{self.source}-{self.name}")

    @property
    def primary_variant(self) -> str:
        if "regular" in self.variant_urls:
            return "regular"
        return sorted(self.variant_urls)[0]

    @property
    def upright_weights(self) -> list[str]:
        """Non-italic weight variants, ordered light to heavy (for a weight-strip specimen)."""
        return sorted(
            (variant for variant in self.variant_urls if variant in _WEIGHT_ORDER),
            key=lambda variant: _WEIGHT_ORDER[variant],
        )

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "FontFamily":
        return cls(**data)
