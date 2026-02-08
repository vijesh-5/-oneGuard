from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT id, username, email, mode FROM users")).fetchall()
    print("Users in database:")
    for row in result:
        print(f"ID: {row[0]}, Username: {row[1]}, Email: {row[2]}, Mode: {row[3]}")
