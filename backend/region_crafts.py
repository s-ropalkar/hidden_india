"""State–craft validation and artisan upload rules from google-images catalog."""
import re

from india_data import STATE_COORDS, STATE_ZONE
from google_images_catalog import scan_all


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def state_coordinates(state: str) -> tuple[float, float]:
    normalized = normalize_state(state) or state
    return STATE_COORDS.get(normalized, (77.21, 28.61))


def _build_state_crafts() -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for state, catalog in scan_all().items():
        items: set[str] = {catalog.highlight, catalog.artisan_category}
        for product in catalog.products:
            items.add(product.name)
            items.add(product.craft)
            items.add(product.category)
        for workshop in catalog.workshops:
            items.add(workshop.title)
            items.add(workshop.category)
        out[state] = sorted(items)
    return out

STATE_CRAFTS = _build_state_crafts()

# token -> states where craft is famous (from catalog)
CRAFT_HOME_STATES: dict[str, set[str]] = {}
for state, names in STATE_CRAFTS.items():
    for craft in names:
        CRAFT_HOME_STATES.setdefault(_norm(craft), set()).add(state)
        for token in re.split(r"[\s&,/&]+", _norm(craft)):
            if len(token) > 3:
                CRAFT_HOME_STATES.setdefault(token, set()).add(state)


def list_states() -> list[str]:
    return sorted(STATE_COORDS.keys())


def all_catalog_crafts() -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for names in STATE_CRAFTS.values():
        for name in names:
            if name not in seen:
                seen.add(name)
                out.append(name)
    return sorted(out)


def crafts_for_state(state: str) -> list[str]:
    normalized = normalize_state(state)
    return STATE_CRAFTS.get(normalized, []) if normalized else []


def normalize_state(name: str) -> str | None:
    n = _norm(name)
    for s in STATE_COORDS:
        if _norm(s) == n:
            return s
    # common aliases
    aliases = {
        "jammu and kashmir": "Jammu & Kashmir",
        "jk": "Jammu & Kashmir",
        "up": "Uttar Pradesh",
        "mp": "Madhya Pradesh",
    }
    return aliases.get(n)


def craft_region_check(craft: str, state: str) -> dict:
    """Return whether a craft is associated with the applicant's state."""
    normalized_state = normalize_state(state) or state
    c = _norm(craft)
    state_list = [_norm(x) for x in STATE_CRAFTS.get(normalized_state, [])]

    local_match = any(c in sc or sc in c for sc in state_list)
    if _norm(normalized_state) in c:
        local_match = True

    famous: set[str] = set()
    for token in re.split(r"[\s&,/&]+", c):
        if len(token) > 3 and token in CRAFT_HOME_STATES:
            famous.update(CRAFT_HOME_STATES[token])
    for sc in state_list:
        if sc in c or c in sc:
            famous.add(normalized_state)

    known = sorted(famous) if famous else ([normalized_state] if local_match else [])
    matches_region = local_match or normalized_state in famous

    return {
        "craft": craft,
        "matchesRegion": matches_region,
        "knownStates": known,
        "primaryState": known[0] if known else None,
    }


def validate_application_crafts(state: str, crafts: list[str]) -> dict:
    normalized = normalize_state(state)
    if not normalized:
        return {"valid": False, "error": f"Unknown state: {state}", "checks": [], "allVerified": False}

    clean = [c.strip() for c in crafts if c and c.strip()]
    if not clean:
        return {"valid": False, "error": "At least one craft required", "checks": [], "allVerified": False}

    checks = [craft_region_check(c, normalized) for c in clean]
    suspicious = [c for c in checks if not c["matchesRegion"]]

    return {
        "valid": True,
        "state": normalized,
        "zone": STATE_ZONE.get(normalized, ""),
        "crafts": clean,
        "checks": checks,
        "allVerified": len(suspicious) == 0,
        "suspiciousCount": len(suspicious),
        "message": (
            "All crafts align with regional heritage catalog"
            if not suspicious
            else f"{len(suspicious)} craft(s) may not traditionally belong to {normalized}"
        ),
    }


def artisan_craft_allowed(profile: dict, craft: str, category: str = "") -> bool:
    approved = profile.get("approved_crafts") or []
    if not approved and profile.get("category"):
        approved = [profile["category"]]
    combined = _norm(f"{craft} {category}")
    for a in approved:
        an = _norm(a)
        if an in combined or combined in an:
            return True
        for token in re.split(r"[\s&,/&]+", an):
            if len(token) > 3 and token in combined:
                return True
    return False


def infer_product_category(craft: str) -> str:
    c = _norm(craft)
    if any(k in c for k in ("pottery", "ceramic", "clay", "terracotta", "blue pottery")):
        return "Ceramics"
    if any(k in c for k in ("weav", "textile", "silk", "loom", "fabric", "coir", "pashmina")):
        return "Textiles"
    return "Decor"
