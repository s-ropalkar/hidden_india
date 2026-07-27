"""Sync google-images into public/images/catalog (delegates to google_images_catalog)."""

from google_images_catalog import PUBLIC_CATALOG, ROOT, scan_all, catalog_summary
from artisan_images_catalog import scan_portrait_artisans, portrait_summary
from pathlib import Path
import shutil


def sync_static_brand_images() -> None:
    public = ROOT / "public" / "images"
    public.mkdir(parents=True, exist_ok=True)

    copies = [
        (ROOT / "src" / "images" / "hidden india image.png", public / "hidden-india-hero.png"),
        (ROOT / "src" / "images" / "india_map.png", public / "india_map.png"),
        (ROOT / "dist" / "images" / "hidden-india-logo.png", public / "hidden-india-logo.png"),
        (ROOT / "dist" / "images" / "artisan-madhubani.jpg", public / "artisan-madhubani.jpg"),
        (ROOT / "dist" / "images" / "artisan-wood-carving.jpg", public / "artisan-wood-carving.jpg"),
    ]
    for src, dest in copies:
        if src.is_file():
            shutil.copy2(src, dest)


def main() -> None:
    sync_static_brand_images()
    catalogs = scan_all()
    summary = catalog_summary(catalogs)
    artisans = portrait_summary(scan_portrait_artisans())
    print(f"Catalog images synced to {PUBLIC_CATALOG}")
    print(f"  States: {summary['states']}")
    print(f"  Products (images): {summary['products']}")
    print(f"  Workshops (with images): {summary['workshops']}")
    print(f"  Artisan portraits: {artisans['artisans']} (google-images/artisans)")


if __name__ == "__main__":
    main()
