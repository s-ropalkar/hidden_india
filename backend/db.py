from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.uri_parser import parse_uri

_client: MongoClient | None = None
_db: Database | None = None

DEFAULT_DB_NAME = "hidden_india"


def _database_name(uri: str) -> str:
    parsed = parse_uri(uri)
    return parsed.get("database") or DEFAULT_DB_NAME


def init_db(uri: str) -> Database:
    global _client, _db
    from config import normalize_mongo_uri

    uri = normalize_mongo_uri(uri)
    _client = MongoClient(uri)
    _db = _client[_database_name(uri)]
    _ensure_indexes(_db)
    return _db


def get_db() -> Database:
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db first.")
    return _db


def col(name: str) -> Collection:
    return get_db()[name]


def _ensure_indexes(db: Database) -> None:
    db.users.create_index("email", unique=True)
    db.users.create_index("role")

    db.artisans.create_index("user_id", sparse=True)
    db.artisans.create_index([("location", "2dsphere")])
    db.artisans.create_index("category")
    db.artisans.create_index("state")

    db.products.create_index("artisan_id")
    db.products.create_index("category")
    db.products.create_index("state")

    db.workshops.create_index("artisan_id")
    db.workshops.create_index([("location", "2dsphere")])
    db.workshops.create_index("date")

    db.regions.create_index("state", unique=True)
    db.regions.create_index([("location", "2dsphere")])

    db.orders.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    db.workshop_registrations.create_index([("user_id", ASCENDING), ("workshop_id", ASCENDING)], unique=True)
    db.artisan_applications.create_index("user_id", unique=True)
    db.artisan_applications.create_index("status")
    db.saved_items.create_index([("user_id", ASCENDING), ("item_type", ASCENDING), ("item_id", ASCENDING)], unique=True)
    db.password_resets.create_index("token", unique=True)
    db.password_resets.create_index("expires_at", expireAfterSeconds=0)
    db.notifications.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    db.notifications.create_index([("user_id", ASCENDING), ("read", ASCENDING)])
