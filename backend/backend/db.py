from psycopg_pool import ConnectionPool
from config import CONFIG

# Database connection details from the configuration
DB_CONFIG = {
    "dbname": CONFIG["database"]["name"],
    "user": CONFIG["database"]["user"],
    "password": CONFIG["database"]["password"],
    "host": CONFIG["database"]["host"],
    "port": CONFIG["database"]["port"],
}

# Initialize a connection pool
pool = ConnectionPool(
    conninfo=f"dbname={DB_CONFIG['dbname']} "
             f"user={DB_CONFIG['user']} "
             f"password={DB_CONFIG['password']} "
             f"host={DB_CONFIG['host']} "
             f"port={DB_CONFIG['port']}",
    max_size=20
)


# Dependency function for FastAPI to provide a database connection
def get_db_connection():
    """Yield a database connection from the pool."""
    with pool.connection() as conn:
        yield conn
