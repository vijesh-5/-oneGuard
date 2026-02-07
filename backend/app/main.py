from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, products, plans, subscriptions
from .database import create_all_tables # Import create_all_tables

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000", # Assuming React frontend runs on port 3000
    "http://localhost:5173", # Add the default Vite port for the frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Call create_all_tables to ensure database tables are created
create_all_tables()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(plans.router, prefix="/plans", tags=["plans"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])

@app.get("/")
async def root():
    return {"message": "Welcome to -oneGuard Backend!"}
