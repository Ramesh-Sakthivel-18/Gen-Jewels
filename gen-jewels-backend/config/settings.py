import os
from dotenv import load_dotenv

load_dotenv()

# Central config for easy changes later
PROJECT_NAME = "Gen Jewels API"
VERSION = "1.0.0"
API_PREFIX = "/api/v1"

# Security
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60 # 30 Days

# AI Configs
GEMINI_MODEL = "gemini-1.5-flash"
SD_MODEL_PATH = r"D:\ramesh\text jewelry\models_cache"