from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from config import CONFIG
from db import lifespan

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
    """Test the database connection asynchronously, print schema, and users."""
    try:
        async with app.async_pool.connection() as conn:
            async with conn.cursor() as cur:
                # Fetch the schema for the 'users' table
                await cur.execute("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' AND table_schema = 'public';
                """)
                schema = await cur.fetchall()

                # Fetch all rows from the 'users' table
                await cur.execute("SELECT * FROM public.users")
                users = await cur.fetchall()

                return {
                    "success": True,
                    "schema": [
                        {"column_name": col[0], "data_type": col[1]} for col in schema
                    ],
                    "users": [dict(zip([desc[0] for desc in cur.description], row)) for row in users]
                }
    except Exception as e:
        return {"success": False, "error": str(e)}

    
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return FileResponse(index_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
