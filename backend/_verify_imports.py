"""Temporary import verification script. Delete after use."""
import sys
sys.path.insert(0, '.')

errors = []

def check(label, fn):
    try:
        fn()
        print(f"  [OK] {label}")
    except Exception as e:
        errors.append(f"  [FAIL] {label}: {e}")
        print(f"  [FAIL] {label}: {e}")

def t_config():
    from config import Config, normalize_mongo_uri
    assert Config.MONGO_URI

def t_database():
    from database import col, init_db, get_db

def t_india_data():
    from india_data import INDIA_CATALOG, STATE_COORDS, STATE_ZONE
    from india_data import pick_artisan_avatar, pick_product_image, pick_workshop_image
    assert len(INDIA_CATALOG) == 30, f"expected 30 states, got {len(INDIA_CATALOG)}"

def t_region_crafts():
    from region_crafts import (
        list_states, all_catalog_crafts, crafts_for_state,
        normalize_state, state_coordinates,
        validate_application_crafts, artisan_craft_allowed, infer_product_category,
    )
    states = list_states()
    crafts = all_catalog_crafts()
    assert len(states) > 0
    assert len(crafts) > 0
    print(f"         ({len(states)} states, {len(crafts)} crafts)")

def t_services():
    from services import (
        hidden_gem_score, point,
        process_cultural_dna, CRAFT_ALIASES, REGION_ALIASES,
        recommend_for_user,
    )
    score = hidden_gem_score({"popularity": 60, "rating": 4.5, "regional_uniqueness": 8.0})
    assert isinstance(score, float)
    assert point(77.0, 28.0) == {"type": "Point", "coordinates": [77.0, 28.0]}

def t_middleware():
    from middleware import (
        hash_password, verify_password,
        create_access_token, create_reset_token, decode_token,
        get_current_user, login_required, role_required, serialize_user,
    )
    h = hash_password("test123")
    assert verify_password("test123", h)

def t_routes():
    from routes import all_blueprints
    names = [bp.name for bp in all_blueprints]
    expected = {"auth", "users", "catalog", "artisans", "workshops", "map", "artisan", "admin"}
    missing = expected - set(names)
    assert not missing, f"missing blueprints: {missing}"
    print(f"         ({len(all_blueprints)} blueprints: {names})")

def t_app():
    import app as app_module
    assert hasattr(app_module, "create_app")
    assert hasattr(app_module, "app")

def t_seed_syntax():
    import ast
    src = open("seed.py").read()
    ast.parse(src)

check("config",        t_config)
check("database",      t_database)
check("india_data",    t_india_data)
check("region_crafts", t_region_crafts)
check("services",      t_services)
check("middleware",    t_middleware)
check("routes",        t_routes)
check("app",           t_app)
check("seed (syntax)", t_seed_syntax)

print()
if errors:
    print(f"FAILED: {len(errors)} error(s)")
    sys.exit(1)
else:
    print("All checks passed — backend is ready to run.")
