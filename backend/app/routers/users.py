from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import User
from ..dependencies import get_current_user
from ..schemas import User as UserSchema

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

class UserModeUpdate(BaseModel):
    mode: str

@router.put("/me/mode", response_model=UserSchema)
def update_user_mode(mode_update: UserModeUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if mode_update.mode not in ["business", "personal"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'business' or 'personal'")
    
    current_user.mode = mode_update.mode
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
