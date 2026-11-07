import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

SECRET_KEY = os.environ.get("SECRET_KEY", "krishisetu-hackathon-secret-key-2026")
DATABASE = os.path.join(BASE_DIR, "krishisetu.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB limit
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# Reference fair-price boundaries in INR for benchmark checks
FAIR_PRICE_RANGES = {
    "fruit": (30.0, 75.0),
    "vegetable": (20.0, 65.0),
    "crop": (15.0, 60.0),
    "egg": (5.0, 12.0),
    "milk": (45.0, 68.0),
    "other": (20.0, 700.0)
}

