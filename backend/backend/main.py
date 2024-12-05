from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

app = FastAPI()

# Read the `FRONTEND_BUILD_PATH` environment variable
frontend_build_path = os.getenv("FRONTEND_BUILD_PATH")
if not frontend_build_path:
    raise RuntimeError("Environment variable `FRONTEND_BUILD_PATH` is not set.")

frontend_build_path = Path(frontend_build_path).resolve()  # Convert to an absolute Path object
index_path = frontend_build_path / "index.html"           # Path to the index.html file

# Serve static assets (like CSS and JS)
app.mount("/static", StaticFiles(directory=frontend_build_path / "static"), name="static")

# Route to serve React's index.html
@app.get("/")
async def serve_react_frontend():
    if index_path.exists():
        return FileResponse(index_path)
    else:
        raise HTTPException(status_code=404, detail="index.html not found.")
