import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.database import Base, engine, create_all_tables
from app import models # Explicitly import models to register them
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

try:
    print("Attempting to drop all tables...")
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped successfully.")
except Exception as e:
    print(f"Error dropping tables: {e}")

try:
    print("Attempting to create all tables...")
    create_all_tables()
    print("All tables created successfully.")
except Exception as e:
    print(f"Error creating tables: {e}")

print("Database refresh script finished.")