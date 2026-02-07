from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import auth, products, plans, subscriptions

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000", # Assuming React frontend runs on port 3000
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(plans.router, prefix="/plans", tags=["plans"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])

@app.get("/")
async def root():
    return {"message": "Welcome to -oneGuard Backend!"}
