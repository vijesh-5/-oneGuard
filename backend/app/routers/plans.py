from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app.models import Plan as DBPlan
from backend.app.schemas import Plan, PlanCreate

router = APIRouter()

@router.post("/plans/", response_model=Plan, status_code=status.HTTP_201_CREATED)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    db_plan = DBPlan(product_id=plan.product_id, name=plan.name, interval=plan.interval, price=plan.price)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/plans/", response_model=List[Plan])
def read_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    plans = db.query(DBPlan).offset(skip).limit(limit).all()
    return plans
