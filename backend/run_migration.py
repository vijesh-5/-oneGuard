import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Database connection details from environment variables or default
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/oneguard_db")



engine = create_engine(SQLALCHEMY_DATABASE_URL)
Base = declarative_base()

# Import models to ensure they are registered with Base metadata
from app import models

print(f"Connecting to database: {SQLALCHEMY_DATABASE_URL}")

try:
    print("Attempting to drop all tables...")
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped successfully.")
except Exception as e:
    print(f"Error dropping tables: {e}")

try:
    print("Attempting to create all tables...")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully.")
except Exception as e:
    print(f"Error creating tables: {e}")

print("Database migration script finished.")
