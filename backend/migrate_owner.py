from sqlalchemy import create_engine, text
from app.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        print("Checking tables for owner_id...")
        tables = ["products", "plans", "taxes", "discounts"]
        
        # Get the first user ID to use as owner
        result = conn.execute(text("SELECT id FROM users ORDER BY id LIMIT 1")).first()
        if not result:
            print("No users found to migrate data to.")
            return
        first_user_id = result[0]
        print(f"Migrating existing data to user ID: {first_user_id}")

        for table in tables:
            try:
                # Check if column exists
                check_col = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='owner_id'")).first()
                if not check_col:
                    print(f"Adding owner_id to {table}...")
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN owner_id INTEGER REFERENCES users(id)"))
                    conn.execute(text(f"UPDATE {table} SET owner_id = :user_id"), {"user_id": first_user_id})
                    conn.commit()
                else:
                    print(f"owner_id already exists in {table}")
            except Exception as e:
                print(f"Error migrating {table}: {e}")

if __name__ == "__main__":
    migrate()
