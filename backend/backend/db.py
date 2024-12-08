from psycopg_pool import AsyncConnectionPool
from contextlib import asynccontextmanager
from config import CONFIG
from fastapi import FastAPI

# Database connection string
DB_CONFIG = CONFIG["database"]
CONNINFO = (
    f"dbname={DB_CONFIG['name']} "
    f"user={DB_CONFIG['user']} "
    f"password={DB_CONFIG['password']} "
    f"host={DB_CONFIG['host']} "
    f"port={DB_CONFIG['port']}"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the connection pool lifecycle."""
    app.async_pool = AsyncConnectionPool(conninfo=CONNINFO, max_size=20)
    yield
    await app.async_pool.close()
