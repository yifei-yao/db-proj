from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from config import CONFIG
from db import get_db_connection

app = FastAPI()

frontend_build_path = Path(CONFIG["frontend"]["build_path"]).resolve()
index_path = frontend_build_path / "index.html"

if not index_path.exists():
    raise RuntimeError(f"index.html not found at {index_path}")

app.mount("/static", StaticFiles(directory=frontend_build_path / "static"), name="static")


@app.get("/")
async def serve_react_frontend():
    return FileResponse(index_path)


@app.get("/test-db")
def test_db_connection(conn=Depends(get_db_connection)):
    """Test the database connection."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")  # Simple query to confirm the connection
            result = cur.fetchone()
            return {"success": True, "result": result[0]}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return FileResponse(index_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
