import os
import re
from datetime import timedelta

from dotenv import load_dotenv

# Prefer backend/.env over inherited shell MONGO_URI (common cause of missing DB name).
load_dotenv(override=True)

DEFAULT_DB_NAME = "hidden_india"


def normalize_mongo_uri(uri: str) -> str:
    """Ensure the URI includes a database name for PyMongo."""
    cleaned = (uri or "").strip() or f"mongodb://localhost:27017/{DEFAULT_DB_NAME}"
    # mongodb://host:port or mongodb://host:port/
    if re.match(r"^mongodb(\+srv)?://[^/]+/?$", cleaned):
        return cleaned.rstrip("/") + f"/{DEFAULT_DB_NAME}"
    return cleaned


class Config:
    MONGO_URI = normalize_mongo_uri(os.getenv("MONGO_URI", f"mongodb://localhost:27017/{DEFAULT_DB_NAME}"))
    JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production").strip()
    JWT_ACCESS_EXPIRES = timedelta(hours=int(os.getenv("JWT_ACCESS_HOURS", "24")))
    JWT_RESET_EXPIRES = timedelta(hours=1)
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001",
    ).split(",")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@hiddenindia.in")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")
    ADMIN_NAME = os.getenv("ADMIN_NAME", "System Supervisor")
