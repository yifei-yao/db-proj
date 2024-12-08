from fastapi import FastAPI, HTTPException, Form, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from pathlib import Path
from config import CONFIG
from db import lifespan
from security import hash_password, verify_password, create_access_token, decode_access_token
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(lifespan=lifespan)

frontend_build_path = Path(CONFIG["frontend"]["build_path"]).resolve()
index_path = frontend_build_path / "index.html"

if not index_path.exists():
    raise RuntimeError(f"index.html not found at {index_path}")

app.mount("/static", StaticFiles(directory=frontend_build_path / "static"), name="static")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Validate the token and retrieve the current user.
    """
    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except Exception as e:
        logging.error(f"Token validation failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.get("/item/{item_id}")
async def find_item_locations(item_id: int, current_user: str = Depends(get_current_user)):
    """
    Fetch and return the locations of all pieces of the given item ID.
    Requires the user to be authenticated.
    """
    try:
        query = """
            SELECT p.pieceNum, p.pDescription, p.length, p.width, p.height, l.roomNum, l.shelfNum, l.shelfDescription
            FROM Piece p
            JOIN Location l ON p.roomNum = l.roomNum AND p.shelfNum = l.shelfNum
            WHERE p.ItemID = %s
        """
        async with app.async_pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, (item_id,))
                pieces = await cur.fetchall()

                if not pieces:
                    raise HTTPException(status_code=404, detail="No pieces found for the given ItemID")

                # Prepare the response
                response = [
                    {
                        "pieceNum": piece[0],
                        "pDescription": piece[1],
                        "length": piece[2],
                        "width": piece[3],
                        "height": piece[4],
                        "roomNum": piece[5],
                        "shelfNum": piece[6],
                        "shelfDescription": piece[7],
                    }
                    for piece in pieces
                ]

                return {"success": True, "item_id": item_id, "pieces": response}

    except HTTPException as e:
        # Re-raise HTTP exceptions to preserve their status code and message
        raise e
    except Exception as e:
        logging.error(f"Error fetching item locations: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching item locations.")


@app.get("/")
async def serve_react_frontend():
    return FileResponse(index_path)


async def execute_query(query: str, params: tuple):
    """Utility function to execute a query with the connection pool."""
    async with app.async_pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, params)


@app.post("/register")
async def register(
    first_name: str = Form(...),
    last_name: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    billAddr: str = Form(None)
):
    """
    Register a new user by hashing their password and storing their details.
    """
    try:
        logging.info(f"Received registration request for username: {username}")

        # Hash the password
        hashed_password = hash_password(password)
        logging.info("Password hashed successfully")

        # Insert into the database
        query = """
            INSERT INTO public.users (first_name, last_name, username, password, role, billAddr)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        logging.info(f"Executing query with params: {first_name}, {last_name}, {username}, {role}, {billAddr}")
        await execute_query(query, (first_name, last_name, username, hashed_password, role, billAddr))
        logging.info("User inserted into database successfully")

        # Return success response
        return {"success": True, "message": "User registered successfully"}

    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=400, detail="Registration failed. Ensure username is unique and inputs are valid.")


@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    """
    Authenticate the user and return a JWT if credentials are valid.
    """
    try:
        # Fetch user data from the database
        query = "SELECT username, password FROM public.users WHERE username = %s"
        async with app.async_pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, (username,))
                user = await cur.fetchone()
                if not user:
                    raise HTTPException(status_code=400, detail="Invalid username or password")

        # Verify the password
        db_username, db_password = user
        if not verify_password(password, db_password):
            raise HTTPException(status_code=400, detail="Invalid username or password")

        # Create a JWT token
        access_token = create_access_token(data={"sub": db_username})
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException as e:
        logging.error(f"HTTP Exception during login: {e.detail}")
        raise e
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


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
