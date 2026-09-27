import os
import sys
import time
import threading
import uvicorn

if "DATABASE_URL" not in os.environ or "postgres" in os.environ.get("DATABASE_URL", ""):
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./govbridge.db"

# Ensure backend directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.main import app

def start_backend():
    config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning", access_log=False)
    server = uvicorn.Server(config)
    server.run()

if __name__ == "__main__":
    t = threading.Thread(target=start_backend, daemon=False)
    t.start()
    t.join()
