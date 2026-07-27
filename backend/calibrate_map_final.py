"""Final calibrated positions with geographic bounding boxes per state."""
from __future__ import annotations

import json
import os

import numpy as np
from PIL import Image

MAP_PATH = r"e:\final_hidden_india\final_hidden_india\public\images\india-states-map.png"
OUT_PATH = r"e:\final_hidden_india\final_hidden_india\src\data\state-map-positions.json"

# (color, tolerance, xmin%, xmax%, ymin%, ymax%)
STATE_QUERIES: dict[str, tuple] = {
    "Jammu & Kashmir": ((230, 70, 70), 25, 0.15, 0.45, 0.02, 0.18),
    "Himachal Pradesh": ((180, 210, 70), 25, 0.28, 0.42, 0.14, 0.26),
    "Punjab": ((240, 180, 40), 25, 0.22, 0.38, 0.12, 0.24),
    "Rajasthan": ((150, 100, 170), 25, 0.10, 0.30, 0.28, 0.44),
    "Delhi": ((190, 140, 140), 30, 0.34, 0.42, 0.28, 0.36),
    "Haryana": ((60, 160, 200), 30, 0.28, 0.42, 0.24, 0.34),
    "Uttarakhand": ((180, 130, 180), 25, 0.32, 0.45, 0.18, 0.30),
    "Uttar Pradesh": ((180, 210, 70), 25, 0.38, 0.52, 0.28, 0.42),
    "Gujarat": ((250, 220, 160), 25, 0.05, 0.22, 0.38, 0.54),
    "Madhya Pradesh": ((220, 200, 220), 25, 0.28, 0.44, 0.40, 0.54),
    "Maharashtra": ((240, 140, 140), 25, 0.20, 0.36, 0.50, 0.64),
    "Goa": ((90, 60, 90), 30, 0.12, 0.22, 0.52, 0.62),
    "Chhattisgarh": ((160, 220, 240), 25, 0.42, 0.54, 0.42, 0.56),
    "Bihar": ((130, 80, 160), 25, 0.48, 0.58, 0.30, 0.42),
    "Jharkhand": ((250, 220, 150), 25, 0.48, 0.58, 0.38, 0.48),
    "West Bengal": ((50, 110, 140), 30, 0.58, 0.72, 0.30, 0.44),
    "Odisha": ((60, 50, 10), 30, 0.48, 0.58, 0.44, 0.58),
    "Sikkim": ((40, 50, 10), 30, 0.52, 0.62, 0.24, 0.34),
    "Assam": ((250, 180, 20), 25, 0.55, 0.82, 0.22, 0.42),
    "Arunachal Pradesh": ((230, 70, 70), 25, 0.72, 0.98, 0.15, 0.45),
    "Nagaland": ((90, 140, 190), 30, 0.70, 0.88, 0.25, 0.38),
    "Manipur": ((150, 100, 170), 25, 0.75, 0.92, 0.32, 0.45),
    "Mizoram": ((250, 220, 160), 25, 0.65, 0.82, 0.38, 0.50),
    "Meghalaya": ((240, 230, 230), 25, 0.55, 0.75, 0.30, 0.45),
    "Tripura": ((240, 250, 240), 25, 0.65, 0.80, 0.40, 0.50),
    "Karnataka": ((130, 80, 160), 25, 0.18, 0.32, 0.64, 0.78),
    "Kerala": ((250, 180, 40), 25, 0.20, 0.34, 0.72, 0.84),
    "Tamil Nadu": ((150, 200, 50), 25, 0.28, 0.40, 0.80, 0.94),
    "Andhra Pradesh": ((240, 110, 120), 25, 0.32, 0.44, 0.68, 0.78),
    "Telangana": ((160, 200, 50), 25, 0.32, 0.44, 0.58, 0.70),
}

# Manual fallback when color detection fails
FALLBACK: dict[str, tuple[float, float]] = {
    "Delhi": (38.0, 32.0),
    "Goa": (18.0, 58.0),
    "Sikkim": (59.0, 30.0),
    "Nagaland": (83.0, 32.0),
}


def centroid_in_box(quant, color, tol, xmin, xmax, ymin, ymax):
    h, w = quant.shape[:2]
    diff = np.abs(quant.astype(np.int32) - np.array(color, dtype=np.int32))
    mask = (diff.sum(axis=2) < tol) & (quant.sum(axis=2) < 720)
    sub = mask[int(h * ymin) : int(h * ymax), int(w * xmin) : int(w * xmax)]
    if not sub.any():
        return None
    ys, xs = np.where(sub)
    xs = xs + int(w * xmin)
    ys = ys + int(h * ymin)
    return round(xs.mean() / w * 100, 1), round(ys.mean() / h * 100, 1)


def main() -> None:
    img = Image.open(MAP_PATH).convert("RGB")
    quant = (np.array(img) // 10) * 10
    positions: dict[str, dict[str, float]] = {}

    for state, (color, tol, xmin, xmax, ymin, ymax) in STATE_QUERIES.items():
        c = centroid_in_box(quant, color, tol, xmin, xmax, ymin, ymax)
        if c:
            positions[state] = {"x": c[0], "y": c[1]}
            print(f"{state:22} {c[0]:5.1f}, {c[1]:5.1f}  (detected)")
        elif state in FALLBACK:
            positions[state] = {"x": FALLBACK[state][0], "y": FALLBACK[state][1]}
            print(f"{state:22} {FALLBACK[state][0]:5.1f}, {FALLBACK[state][1]:5.1f}  (fallback)")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(positions, f, indent=2, sort_keys=True)

    print(f"\nWrote {len(positions)} states to {OUT_PATH}")


if __name__ == "__main__":
    main()
