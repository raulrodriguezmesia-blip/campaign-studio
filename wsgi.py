"""WSGI/ASGI entrypoint for deployment (Render, etc.).

Render runs from the repo root by default, so we expose the FastAPI
app here instead of relying on a `backend.` import path.
"""
import sys
from pathlib import Path

# Make sure the backend package is importable from the repo root.
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.src.main import app  # noqa: E402

# Render may set PYTHON_VERSION via env; uvicorn picks PORT automatically.
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "wsgi:app",
        host="0.0.0.0",
        port=int(__import__("os").environ.get("PORT", "8000")),
    )
