import os
# Mock required env vars BEFORE importing settings
os.environ["MONGODB_URL"] = "mongodb://localhost:27017/test"

from backend.config import Settings

print("--- Test 1: Default (from .env or config defaults) ---")
try:
    s = Settings()
    print(f"PUBLIC_BACKEND_URL: {s.PUBLIC_BACKEND_URL}")
    print(f"GOOGLE_REDIRECT_URI: {s.GOOGLE_REDIRECT_URI}")
except Exception as e:
    print(f"Error loading settings: {e}")

print("\n--- Test 2: Env Var Override ---")
os.environ["PUBLIC_BACKEND_URL"] = "http://test-server.com:9999"
try:
    # Re-instantiate Settings to pick up env var override
    s2 = Settings()
    print(f"PUBLIC_BACKEND_URL: {s2.PUBLIC_BACKEND_URL}")
    print(f"GOOGLE_REDIRECT_URI: {s2.GOOGLE_REDIRECT_URI}")
except Exception as e:
    print(f"Error loading settings: {e}")
