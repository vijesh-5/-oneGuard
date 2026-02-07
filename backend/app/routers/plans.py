from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Plan as DBPlan
from ..schemas import Plan, PlanCreate

router = APIRouter()

@router.post("/plans/", response_model=Plan, status_code=status.HTTP_201_CREATED)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    db_plan = DBPlan(
        product_id=plan.product_id,
        name=plan.name,
        billing_period=plan.billing_period,
        price=plan.price,
        min_quantity=plan.min_quantity,
        auto_close=plan.auto_close,
        pausable=plan.pausable,
        renewable=plan.renewable,
        start_date=plan.start_date,
        end_date=plan.end_date
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/plans/", response_model=List[Plan])
def read_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    plans = db.query(DBPlan).offset(skip).limit(limit).all()
    return plans
