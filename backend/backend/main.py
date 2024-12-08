from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

app = FastAPI()

frontend_build_path = os.getenv("FRONTEND_BUILD_PATH")
if not frontend_build_path:
    raise RuntimeError("Environment variable `FRONTEND_BUILD_PATH` is not set.")

frontend_build_path = Path(frontend_build_path).resolve()

index_path = frontend_build_path / "index.html"

if not index_path.exists():
    raise RuntimeError(f"index.html not found at {index_path}")

app.mount("/static", StaticFiles(directory=frontend_build_path / "static"), name="static")


@app.get("/")
async def serve_react_frontend():
    return FileResponse(index_path)


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return FileResponse(index_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
