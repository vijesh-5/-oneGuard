from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Plan as DBPlan, Product as DBProduct, User
from ..schemas import Plan, PlanCreate
from ..auth_utils import get_current_user

router = APIRouter()

@router.post("/", response_model=Plan, status_code=status.HTTP_201_CREATED)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Validate product ownership
    product = db.query(DBProduct).filter(DBProduct.id == plan.product_id, DBProduct.owner_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated product not found")

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
        owner_id=current_user.id
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/", response_model=List[Plan])
def read_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plans = db.query(DBPlan).filter(DBPlan.owner_id == current_user.id).offset(skip).limit(limit).all()
    return plans

@router.get("/{plan_id}", response_model=Plan)
def read_plan(plan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = db.query(DBPlan).filter(DBPlan.id == plan_id, DBPlan.owner_id == current_user.id).first()
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan

@router.patch("/{plan_id}", response_model=Plan)
def update_plan(plan_id: int, plan: PlanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_plan = db.query(DBPlan).filter(DBPlan.id == plan_id, DBPlan.owner_id == current_user.id).first()
    if db_plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    
    db_plan.product_id = plan.product_id
    db_plan.name = plan.name
    db_plan.billing_period = plan.billing_period
    db_plan.price = plan.price
    db_plan.min_quantity = plan.min_quantity
    db_plan.auto_close = plan.auto_close
    db_plan.pausable = plan.pausable
    db_plan.renewable = plan.renewable
    db_plan.start_date = plan.start_date
    db_plan.end_date = plan.end_date
    
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_plan = db.query(DBPlan).filter(DBPlan.id == plan_id, DBPlan.owner_id == current_user.id).first()
    if db_plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    
    db.delete(db_plan)
    db.commit()
    return {"ok": True}
