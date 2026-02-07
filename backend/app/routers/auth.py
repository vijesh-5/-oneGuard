from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.schemas import LoginRequest, LoginResponse

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # This is a mock login for now. In a real application, you would
    # verify credentials against a database and generate a proper JWT.
    if request.username == "testuser" and request.password == "testpassword":
        # For a mock, we can just return a placeholder token
        return LoginResponse(message="Login successful", access_token="mock_access_token")
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
