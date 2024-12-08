from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from config import CONFIG
from db import lifespan
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password for storing in the database."""
    return pwd_context.hash(password)


app = FastAPI(lifespan=lifespan)

frontend_build_path = Path(CONFIG["frontend"]["build_path"]).resolve()
index_path = frontend_build_path / "index.html"

if not index_path.exists():
    raise RuntimeError(f"index.html not found at {index_path}")

app.mount("/static", StaticFiles(directory=frontend_build_path / "static"), name="static")


@app.get("/")
async def serve_react_frontend():
    return FileResponse(index_path)


@app.get("/test-db")
async def test_db_connection():
    """Test the database connection asynchronously."""
    try:
        async with app.async_pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
                result = await cur.fetchone()
                return {"success": True, "result": result[0]}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return FileResponse(index_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
