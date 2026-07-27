"""Build seed catalog directly from google-images folder structure.

Rules:
- Each artifact subfolder with N images → N products + N artisans (one per image).
- Each Workshops_* subfolder with images → one workshop (first image as thumbnail).
- States/items without images are omitted.
"""

from __future__ import annotations

import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path

from india_data import INDIA_CATALOG, STATE_COORDS, STATE_ZONE
from state_artisans import STATE_PEER_ARTISANS

ROOT = Path(__file__).resolve().parent.parent / "final_hidden_india"
GI_ROOT = ROOT / "google-images" / "google-images"
PUBLIC_CATALOG = ROOT / "public" / "images" / "catalog"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
SKIP_ARTIFACT_DIRS = {"workshop", "punjab", "rajasthan", "haryana", "delhi", "goa", "kerala", "bihar"}

DIR_TO_STATE: dict[str, str] = {
    "Jammu_and_Kashmir": "Jammu & Kashmir",
    "goa": "Goa",
    "sikkim": "Sikkim",
}


@dataclass
class CatalogProduct:
    name: str
    image: str
    category: str
    craft: str
    base_price: int
    artisan_name: str
    artisan_bio: str
    artisan_tag: str
    folder: str


@dataclass
class CatalogWorkshop:
    title: str
    image: str
    category: str
    folder: str


@dataclass
class StateCatalog:
    state: str
    zone: str
    highlight: str
    artisan_category: str
    products: list[CatalogProduct] = field(default_factory=list)
    workshops: list[CatalogWorkshop] = field(default_factory=list)


def infer_product_category(craft: str) -> str:
    c = craft.lower()
    if any(k in c for k in ("pottery", "ceramic", "clay", "terracotta", "blue pottery")):
        return "Ceramics"
    if any(k in c for k in ("weav", "textile", "silk", "loom", "fabric", "coir", "pashmina", "shawl", "rug", "dupatta", "jutti")):
        return "Textiles"
    return "Decor"


def slug(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "item"


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def resolve_state(dir_name: str) -> str | None:
    if dir_name in DIR_TO_STATE:
        return DIR_TO_STATE[dir_name]
    target = norm(dir_name.replace("_", " "))
    for state in STATE_COORDS:
        if norm(state) == target:
            return state
    return None


def list_images(folder: Path) -> list[Path]:
    images = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in IMAGE_EXTS]
    images.sort(
        key=lambda f: (
            0 if f.suffix.lower() in (".jpg", ".jpeg", ".png") else 1,
            f.name.lower(),
        )
    )
    return images


def folder_to_craft_name(folder: str, state: str) -> str:
    name = folder.replace("_", " ")
    for part in [state, state.replace(" & ", "_and_"), state.replace(" ", "_")]:
        name = re.sub(re.escape(part), "", name, flags=re.IGNORECASE)
    name = re.sub(r"[\s\-–—]+", " ", name).strip(" -_")
    name = re.sub(r"\s+", " ", name)
    if not name:
        return folder.replace("_", " ")
    return name[0].upper() + name[1:] if name else folder


def workshop_folder_to_title(folder: str) -> str:
    title = folder.replace("Workshops_", "").replace("Workshops ", "")
    title = title.replace("_", " ").strip()
    title = re.sub(r"\s+", " ", title)
    return title[0].upper() + title[1:] if title else folder


def variant_label(index: int, total: int) -> str:
    if total <= 1 or index == 0:
        return ""
    labels = ["Classic", "Royal", "Artisan", "Signature", "Limited"]
    if index - 1 < len(labels):
        return f" — {labels[index - 1]} Edition"
    return f" — Edition {index + 1}"


def state_metadata(state: str) -> tuple[str, str, str, str]:
    if state in INDIA_CATALOG:
        highlight, primary, category, bio, _, _ = INDIA_CATALOG[state]
        return highlight, category, primary, bio
    return "Traditional Craft", "Decor", "Heritage Artisan", f"Master craftsperson from {state}."


def artisan_roster(state: str) -> list[tuple[str, str, str]]:
    highlight, category, primary, primary_bio = state_metadata(state)
    roster: list[tuple[str, str, str]] = [(primary, primary_bio, "Master Craftsman")]
    for name, bio in STATE_PEER_ARTISANS.get(state, []):
        roster.append((name, bio, "Heritage Artisan"))
    if not roster:
        roster.append((f"{state} Artisan", f"Traditional maker from {state}.", "Heritage Artisan"))
    return roster


def guess_price(state: str, craft_name: str) -> int:
    if state not in INDIA_CATALOG:
        return 3500
    _, _, _, _, artifacts, _ = INDIA_CATALOG[state]
    cn = norm(craft_name)
    for art_name, _, price in artifacts:
        an = norm(art_name)
        if cn in an or an in cn:
            return price
        if norm(craft_name.split("—")[0].strip()) == an:
            return price
    return 3500


def copy_image(state: str, folder_slug: str, index: int, source: Path) -> str:
    dest_dir = PUBLIC_CATALOG / slug(state)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{folder_slug}-{index + 1}{source.suffix.lower()}"
    if not dest.exists() or dest.stat().st_mtime < source.stat().st_mtime:
        shutil.copy2(source, dest)
    return f"/images/catalog/{slug(state)}/{dest.name}"


def unique_artisan_name(base: str, craft: str, used: set[str]) -> str:
    if base not in used:
        used.add(base)
        return base
    short = craft.split("—")[0].strip().split()[0] if craft else "Craft"
    candidate = f"{base} · {short}"
    n = 2
    while candidate in used:
        candidate = f"{base} · {short} {n}"
        n += 1
    used.add(candidate)
    return candidate


def scan_state(state_dir: Path, state: str) -> StateCatalog:
    highlight, artisan_category, _, _ = state_metadata(state)
    zone = STATE_ZONE.get(state, "")
    catalog = StateCatalog(
        state=state,
        zone=zone,
        highlight=highlight,
        artisan_category=artisan_category,
    )
    used_artisan_names: set[str] = set()
    roster = artisan_roster(state)

    artifact_dirs = [
        d
        for d in sorted(state_dir.iterdir())
        if d.is_dir()
        and not d.name.startswith("Workshops")
        and d.name.lower() not in SKIP_ARTIFACT_DIRS
    ]

    for art_dir in artifact_dirs:
        images = list_images(art_dir)
        if not images:
            continue

        craft = folder_to_craft_name(art_dir.name, state)
        category = infer_product_category(craft)
        base_price = guess_price(state, craft)
        folder_slug = slug(art_dir.name)

        for i, img_path in enumerate(images):
            product_name = craft + variant_label(i, len(images))
            image_url = copy_image(state, folder_slug, i, img_path)
            roster_name, roster_bio, tag = roster[i % len(roster)]
            artisan_name = unique_artisan_name(roster_name, craft, used_artisan_names)

            catalog.products.append(
                CatalogProduct(
                    name=product_name,
                    image=image_url,
                    category=category,
                    craft=craft,
                    base_price=base_price + i * 175,
                    artisan_name=artisan_name,
                    artisan_bio=roster_bio,
                    artisan_tag=tag,
                    folder=art_dir.name,
                )
            )

    for ws_dir in sorted(state_dir.iterdir()):
        if not ws_dir.is_dir() or not ws_dir.name.startswith("Workshops"):
            continue
        images = list_images(ws_dir)
        if not images:
            continue
        title = workshop_folder_to_title(ws_dir.name)
        image_url = copy_image(state, slug(ws_dir.name), 0, images[0])
        catalog.workshops.append(
            CatalogWorkshop(
                title=title,
                image=image_url,
                category="Hands-on" if "master" not in title.lower() else "Masterclass",
                folder=ws_dir.name,
            )
        )

    return catalog


def scan_all() -> dict[str, StateCatalog]:
    if not GI_ROOT.is_dir():
        return {}

    catalogs: dict[str, StateCatalog] = {}
    for state_dir in sorted(GI_ROOT.iterdir()):
        if not state_dir.is_dir():
            continue
        state = resolve_state(state_dir.name)
        if not state:
            continue
        catalog = scan_state(state_dir, state)
        if catalog.products or catalog.workshops:
            catalogs[state] = catalog
    return catalogs


def catalog_summary(catalogs: dict[str, StateCatalog]) -> dict:
    total_products = sum(len(c.products) for c in catalogs.values())
    total_workshops = sum(len(c.workshops) for c in catalogs.values())
    total_artisans = total_products  # one artisan per product image
    return {
        "states": len(catalogs),
        "products": total_products,
        "workshops": total_workshops,
        "artisans": total_artisans,
    }
