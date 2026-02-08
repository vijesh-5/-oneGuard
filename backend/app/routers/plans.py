from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Plan as DBPlan, Product as DBProduct, User
from ..schemas import Plan, PlanCreate
from ..dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=Plan, status_code=status.HTTP_201_CREATED)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify product belongs to user
    product = db.query(DBProduct).filter(DBProduct.id == plan.product_id, DBProduct.user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

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
        end_date=plan.end_date,
        user_id=current_user.id
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/", response_model=List[Plan])
def read_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plans = db.query(DBPlan).filter(DBPlan.user_id == current_user.id).offset(skip).limit(limit).all()
    return plans
