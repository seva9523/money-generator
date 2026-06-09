#!/usr/bin/env python3
"""Validate the static affiliate microsite configuration."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    ROOT / "index.html",
    ROOT / "styles.css",
    ROOT / "scripts" / "app.js",
    ROOT / "data" / "offers.json",
]
REQUIRED_TOP_LEVEL_FIELDS = {"siteName", "tagline", "disclosure", "heroCta", "offers"}
REQUIRED_OFFER_FIELDS = {
    "name",
    "category",
    "headline",
    "commission",
    "effort",
    "audience",
    "affiliateUrl",
    "rating",
    "featured",
}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def require_files() -> None:
    missing = [str(path.relative_to(ROOT)) for path in REQUIRED_FILES if not path.exists()]
    if missing:
        fail(f"Missing required files: {', '.join(missing)}")


def require_text(value: object, field: str) -> None:
    if not isinstance(value, str) or not value.strip():
        fail(f"{field} must be a non-empty string")


def require_url(value: object, field: str) -> None:
    require_text(value, field)
    parsed = urlparse(str(value))
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        fail(f"{field} must be an absolute http(s) URL")


def validate() -> None:
    require_files()

    config_path = ROOT / "data" / "offers.json"
    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in data/offers.json: {exc}")

    missing_fields = REQUIRED_TOP_LEVEL_FIELDS - set(config)
    if missing_fields:
        fail(f"Missing top-level fields: {', '.join(sorted(missing_fields))}")

    for field in ["siteName", "tagline", "disclosure"]:
        require_text(config[field], field)

    hero_cta = config["heroCta"]
    if not isinstance(hero_cta, dict):
        fail("heroCta must be an object")
    require_text(hero_cta.get("label"), "heroCta.label")
    require_text(hero_cta.get("url"), "heroCta.url")

    offers = config["offers"]
    if not isinstance(offers, list) or not offers:
        fail("offers must be a non-empty list")

    for index, offer in enumerate(offers, start=1):
        if not isinstance(offer, dict):
            fail(f"Offer #{index} must be an object")
        missing_offer_fields = REQUIRED_OFFER_FIELDS - set(offer)
        if missing_offer_fields:
            fail(f"Offer #{index} missing fields: {', '.join(sorted(missing_offer_fields))}")

        for field in ["name", "category", "headline", "commission", "effort", "audience"]:
            require_text(offer[field], f"offers[{index}].{field}")
        require_url(offer["affiliateUrl"], f"offers[{index}].affiliateUrl")

        if not isinstance(offer["rating"], (int, float)) or not 0 <= offer["rating"] <= 5:
            fail(f"offers[{index}].rating must be a number between 0 and 5")
        if not isinstance(offer["featured"], bool):
            fail(f"offers[{index}].featured must be true or false")

    print(f"Validated {len(offers)} offers and {len(REQUIRED_FILES)} static assets.")


if __name__ == "__main__":
    validate()
